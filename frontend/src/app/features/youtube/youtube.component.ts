import { Component, OnInit, NgZone } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VideoService } from '../../core/services/video.service';
import { Video } from '../../core/models/video.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-youtube',
  templateUrl: './youtube.component.html',
  styleUrls: ['./youtube.component.css']
})
export class YoutubeComponent implements OnInit {
  videos: Video[] = [];
  selectedVideo: Video | null = null;
  safeVideoUrl: SafeResourceUrl | null = null;
  loading = true;

  categories = ['All', 'Mobile', 'My Video', 'youtube', 'song', 'cartton song'];
  selectedCategory = 'All';
  private ytPlayer: any = null;

  constructor(
    private videoService: VideoService,
    private sanitizer: DomSanitizer,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.fetchVideos();
  }

  fetchVideos(): void {
    this.loading = true;
    this.videoService.getRandomVideos(this.selectedCategory).subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          this.videos = res.data;
        } else {
          this.videos = [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching videos', err);
        this.loading = false;
      }
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.fetchVideos();
  }


  openVideo(video: Video): void {
    this.selectedVideo = video;
    
    // Initialize YouTube Player via official IFrame API
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
      
      (window as any).onYouTubeIframeAPIReady = () => {
        this.createPlayer();
      };
    } else {
      setTimeout(() => this.createPlayer(), 0);
    }
  }

  createPlayer(): void {
    if (this.ytPlayer) {
      this.ytPlayer.destroy();
    }
    
    this.ytPlayer = new (window as any).YT.Player('yt-player', {
      height: '100%',
      width: '100%',
      playerVars: {
        autoplay: 1,
        rel: 0,
        modestbranding: 1,
        iv_load_policy: 3, // Disable video annotations
        showinfo: 0,       // Deprecated but still applies to some legacy embeds
        fs: 0,             // Hide fullscreen button to prevent breakout
        vq: 'hd720'        // Legacy URL parameter hack for quality
      },
      events: {
        onReady: (event: any) => {
          // Initialize video with explicit suggestedQuality
          if (this.selectedVideo) {
            event.target.loadVideoById({
              videoId: this.selectedVideo.videoId,
              suggestedQuality: 'hd720'
            });
          }
        },
        onStateChange: (event: any) => {
          // Force HD playback
          if (event.data === 1 || event.data === -1 || event.data === 3) {
            event.target.setPlaybackQuality('hd720');
          }
          
          // YT.PlayerState.ENDED === 0
          if (event.data === 0) {
            this.ngZone.run(() => {
              this.closeVideo();
            });
          }
        }
      }
    });
  }

  getThumbnailUrl(video: Video): string {
    return `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
  }

  closeVideo(): void {
    if (this.ytPlayer) {
      this.ytPlayer.destroy();
      this.ytPlayer = null;
    }
    this.selectedVideo = null;
  }
}

