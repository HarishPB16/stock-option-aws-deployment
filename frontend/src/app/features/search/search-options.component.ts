import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OptionsService, OptionInsight } from '../../core/services/options.service';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-search-options',
    templateUrl: './search-options.component.html',
    styleUrls: ['./search-options.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchOptionsComponent {
    optionForm: FormGroup;
    isLoading = false;
    isDeleting = false;
    insight: OptionInsight | null = null;
    simpleAdvice: string | null = null;
    isAdviceCached: boolean = false;
    showAdviceModal: boolean = false;
    showForecastModal: boolean = false;
    activeForecastText: string = '';
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
        this.simpleAdvice = null;
        this.isAdviceCached = false;

        // Explicitly pushing to view since OnPush is enabled
        this.cdr.markForCheck();

        const ticker = this.optionForm.value.ticker.toUpperCase();

        forkJoin({
            suggest: this.optionsService.suggestOption(ticker),
            ask: this.optionsService.askOption(ticker)
        })
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                    this.cdr.markForCheck();
                })
            )
            .subscribe({
                next: (result) => {
                    const suggestRes = result.suggest;
                    const askRes = result.ask;

                    if (suggestRes.success && suggestRes.data) {
                        this.insight = suggestRes.data.insight;
                    } else {
                        this.errorMessage = 'Failed to retrieve valid data from server.';
                    }

                    if (askRes.success && askRes.data) {
                        this.simpleAdvice = askRes.data.advice;
                        this.isAdviceCached = askRes.cached;
                    }
                },
                error: (err) => {
                    this.errorMessage = err.message || 'An unexpected error occurred.';
                }
            });
    }

    openAdviceModal() {
        this.showAdviceModal = true;
    }

    openForecastModal(text: string) {
        this.activeForecastText = text;
        this.showForecastModal = true;
    }

    closeModals() {
        this.showAdviceModal = false;
        this.showForecastModal = false;
        this.activeForecastText = '';
    }

    onDelete() {
        if (!this.insight) return;

        const ticker = this.optionForm.value.ticker.toUpperCase();
        this.isDeleting = true;
        this.cdr.markForCheck();

        this.optionsService.deleteOption(ticker)
            .pipe(
                finalize(() => {
                    this.isDeleting = false;
                    this.cdr.markForCheck();
                })
            )
            .subscribe({
                next: () => {
                    // Clear the current view as records are gone
                    this.insight = null;
                    this.simpleAdvice = null;
                    this.isAdviceCached = false;
                    this.optionForm.reset();
                },
                error: (err) => {
                    this.errorMessage = err.message || 'Failed to delete records.';
                }
            });
    }
}
