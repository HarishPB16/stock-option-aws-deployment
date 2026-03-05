import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OptionsService, OptionInsight } from '../../core/services/options.service';
import { NSESecurity, NSE_STOCKS } from '../../core/data/nse-stocks.data';
import { finalize, startWith, map } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';

@Component({
    selector: 'app-search-options',
    templateUrl: './search-options.component.html',
    styleUrls: ['./search-options.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchOptionsComponent implements OnInit {
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

    filteredStocks$: Observable<NSESecurity[]>;
    showDropdown: boolean = false;

    constructor(
        private fb: FormBuilder,
        private optionsService: OptionsService,
        private cdr: ChangeDetectorRef
    ) {
        this.optionForm = this.fb.group({
            ticker: ['', [Validators.required]]
        });

        // Initialize with empty array until user interacts
        this.filteredStocks$ = this.optionForm.get('ticker')!.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value || ''))
        );
    }

    ngOnInit(): void { }

    private _filter(value: string): NSESecurity[] {
        const filterValue = value.toLowerCase();

        if (!filterValue) return [];

        return NSE_STOCKS.filter(stock =>
            stock.name.toLowerCase().includes(filterValue) ||
            stock.ticker.toLowerCase().includes(filterValue)
        );
    }

    selectStock(stock: NSESecurity) {
        this.optionForm.get('ticker')?.setValue(`${stock.name} (${stock.ticker})`);
        this.showDropdown = false;
        // Optionally auto-submit: this.onSubmit();
    }

    onFocus() {
        this.showDropdown = true;

        // Trigger a value change to open the dropdown with current text if any, 
        // or we could show top ones if empty, but we return [] if empty above.
        // Let's modify slightly if we want to show all on focus. (Opted not to for 99 items).
    }

    // Delay hiding to allow click event on dropdown item to fire first
    onBlur() {
        setTimeout(() => {
            this.showDropdown = false;
            this.cdr.markForCheck();
        }, 200);
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

        const queryTicker = this.optionForm.value.ticker; // Keep exactly as User requested: name (ticker)

        forkJoin({
            suggest: this.optionsService.suggestOption(queryTicker),
            ask: this.optionsService.askOption(queryTicker)
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

        const rawTicker = this.optionForm.value.ticker.toUpperCase();
        // If it's in the format "Name (TICKER)", extract TICKER
        const match = rawTicker.match(/\(([^)]+)\)/);
        const ticker = match ? match[1] : rawTicker;

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
