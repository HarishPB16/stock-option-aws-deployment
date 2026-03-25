import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VideoService } from '../../../../core/services/video.service';
import { VideoResponse } from '../../../../core/models/video.model';

@Component({
  selector: 'app-youtube-admin',
  templateUrl: './youtube-admin.component.html',
  styleUrls: ['./youtube-admin.component.css']
})
export class YoutubeAdminComponent {
  videoForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  availableCategories = ['Mobile', 'My Video', 'youtube', 'song', 'cartton song'];
  selectedCategories: string[] = [];

  constructor(
    private fb: FormBuilder,
    private videoService: VideoService
  ) {
    this.videoForm = this.fb.group({
      url: ['', [Validators.required, Validators.pattern(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/)]],
      title: ['', Validators.required]
    });
  }

  toggleCategory(category: string): void {
    const idx = this.selectedCategories.indexOf(category);
    if (idx > -1) {
      this.selectedCategories.splice(idx, 1);
    } else {
      this.selectedCategories.push(category);
    }
  }

  onSubmit(): void {
    if (this.videoForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const { url, title } = this.videoForm.value;

    this.videoService.addVideo(url, title, this.selectedCategories).subscribe({
      next: (res: VideoResponse) => {
        if (res.success) {
          this.successMessage = 'Video added successfully!';
          this.videoForm.reset();
          this.selectedCategories = [];
        } else {
          this.errorMessage = res.message || 'Failed to add video.';
        }
        this.isSubmitting = false;
      },
      error: (err: any) => {
        console.error('Error adding video:', err);
        this.errorMessage = err.error?.message || 'An error occurred while adding the video.';
        this.isSubmitting = false;
      }
    });
  }
}
