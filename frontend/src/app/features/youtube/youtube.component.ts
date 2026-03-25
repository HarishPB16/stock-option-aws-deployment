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

  categories = ['All', 'Mobile', 'My Video', 'youtube', 'song', 'cartton song'];
  selectedCategory = 'All';


  constructor(
    private videoService: VideoService,
    private sanitizer: DomSanitizer
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
    const embedUrl = `https://www.youtube.com/embed/${video.videoId}?autoplay=1`;
    this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  getThumbnailUrl(video: Video): string {
    return `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
  }

  closeVideo(): void {
    this.selectedVideo = null;
    this.safeVideoUrl = null;
  }
}
