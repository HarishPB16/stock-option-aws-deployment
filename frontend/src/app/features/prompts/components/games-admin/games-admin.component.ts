import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GameService } from '../../../../core/services/game.service';

@Component({
  selector: 'app-games-admin',
  templateUrl: './games-admin.component.html',
  styleUrls: ['./games-admin.component.css']
})
export class GamesAdminComponent {
  gameForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private gameService: GameService
  ) {
    this.gameForm = this.fb.group({
      name: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.*/)]],
      description: ['']
    });
  }

  onSubmit(): void {
    if (this.gameForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const newGame = this.gameForm.value;

    this.gameService.addGame(newGame).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = 'Game added successfully!';
          this.gameForm.reset();
        } else {
          this.errorMessage = res.message || 'Failed to add game.';
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error adding game:', err);
        this.errorMessage = err.error?.message || 'An error occurred while adding the game.';
        this.isSubmitting = false;
      }
    });
  }
}
