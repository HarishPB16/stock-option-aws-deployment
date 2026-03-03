import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OptionsService, OptionInsight } from '../../core/services/options.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-options',
    templateUrl: './options.component.html',
    styleUrls: ['./options.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptionsComponent {
    optionForm: FormGroup;
    isLoading = false;
    insight: OptionInsight | null = null;
    errorMessage: string | null = null;

    constructor(
        private fb: FormBuilder,
        private optionsService: OptionsService,
        private cdr: ChangeDetectorRef
    ) {
        this.optionForm = this.fb.group({
            ticker: ['', [Validators.required]]
        });
    }

    onSubmit() {
        if (this.optionForm.invalid) {
            this.optionForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.errorMessage = null;
        this.insight = null;

        // Explicitly pushing to view since OnPush is enabled
        this.cdr.markForCheck();

        const ticker = this.optionForm.value.ticker.toUpperCase();

        this.optionsService.suggestOption(ticker)
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                    this.cdr.markForCheck();
                })
            )
            .subscribe({
                next: (response) => {
                    if (response.success && response.data) {
                        this.insight = response.data.insight;
                    } else {
                        this.errorMessage = 'Failed to retrieve valid data from server.';
                    }
                },
                error: (err) => {
                    this.errorMessage = err.message || 'An unexpected error occurred.';
                }
            });
    }
}
