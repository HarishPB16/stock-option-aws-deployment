import { Component, OnInit } from '@angular/core';
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

  constructor(
    private videoService: VideoService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.fetchVideos();
  }

  fetchVideos(): void {
    this.loading = true;
    this.videoService.getRandomVideos().subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          this.videos = res.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching videos', err);
        this.loading = false;
      }
    });
  }

  openVideo(video: Video): void {
    this.selectedVideo = video;
    const embedUrl = `https://www.youtube.com/embed/${video.videoId}?autoplay=1`;
    this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  getThumbnailUrl(video: Video): string {
    const baseUrl = environment.apiUrl.replace(/\/api\/v1\/?$/, '');
    return `${baseUrl}${video.thumbnailUrl}`;
  }

  closeVideo(): void {
    this.selectedVideo = null;
    this.safeVideoUrl = null;
  }
}
