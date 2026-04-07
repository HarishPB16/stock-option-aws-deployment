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

  parentCategories = ['child', 'stock market', 'technical'];
  selectedParentCategory = 'child';

  categoryMap: { [key: string]: string[] } = {
    'child': ['Mobile', 'My Video', 'youtube', 'song', 'cartton song'],
    'stock market': ['All'],
    'technical': ['AI', 'prompt', 'GenAI', 'AWS', 'python', 'angular', 'react', 'Node js', 'Javascript', 'Typescript', 'Design pattern', 'system design', 'GraphQL', 'Database', 'Kubernetes', 'Security', 'Git', 'others']
  };

  get availableCategories(): string[] {
    return this.categoryMap[this.selectedParentCategory] || [];
  }

  onParentCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedParentCategory = target.value;
    this.selectedCategories = [];
  }

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
    const finalCategories = [...new Set([...this.selectedCategories, this.selectedParentCategory])];

    this.videoService.addVideo(url, title, finalCategories).subscribe({
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
