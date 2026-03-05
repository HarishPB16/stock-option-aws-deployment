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

    // Gemini State
    isGeminiLoading = false;
    insightGemini: OptionInsight | null = null;
    simpleAdviceGemini: string | null = null;
    isAdviceCachedGemini: boolean = false;

    // ChatGPT State
    isChatGPTLoading = false;
    insightChatGPT: OptionInsight | null = null;
    simpleAdviceChatGPT: string | null = null;
    isAdviceCachedChatGPT: boolean = false;

    // Modals
    showAdviceModal: boolean = false;
    showForecastModal: boolean = false;
    activeForecastText: string = '';
    activeAdviceHtml: string = '';
    activeAdviceIsCached: boolean = false;
    activeAdviceTitle: string = '';

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

        // Reset all specific AI states
        this.insightGemini = null;
        this.simpleAdviceGemini = null;
        this.isAdviceCachedGemini = false;
        this.isGeminiLoading = true;

        this.insightChatGPT = null;
        this.simpleAdviceChatGPT = null;
        this.isAdviceCachedChatGPT = false;
        this.isChatGPTLoading = true;

        this.cdr.markForCheck();

        const queryTicker = this.optionForm.value.ticker; // "Name (TICKER)" format

        // 1. Fire Gemini Requests
        forkJoin({
            suggest: this.optionsService.suggestOption(queryTicker),
            ask: this.optionsService.askOption(queryTicker)
        }).pipe(
            finalize(() => {
                this.isGeminiLoading = false;
                this.checkOverallLoadingState();
                this.cdr.markForCheck();
            })
        ).subscribe({
            next: (result) => {
                if (result.suggest.success && result.suggest.data) {
                    this.insightGemini = result.suggest.data.insight;
                }
                if (result.ask.success && result.ask.data) {
                    this.simpleAdviceGemini = result.ask.data.advice;
                    this.isAdviceCachedGemini = result.ask.cached;
                }
            },
            error: (err) => {
                this.errorMessage = this.errorMessage
                    ? this.errorMessage + ' | Gemini: ' + err.message
                    : 'Gemini Error: ' + err.message;
            }
        });

        // 2. Fire ChatGPT Requests concurrently but independently
        forkJoin({
            suggest: this.optionsService.suggestOptionChatGPT(queryTicker),
            ask: this.optionsService.askOptionChatGPT(queryTicker)
        }).pipe(
            finalize(() => {
                this.isChatGPTLoading = false;
                this.checkOverallLoadingState();
                this.cdr.markForCheck();
            })
        ).subscribe({
            next: (result) => {
                if (result.suggest.success && result.suggest.data) {
                    this.insightChatGPT = result.suggest.data.insight;
                }
                if (result.ask.success && result.ask.data) {
                    this.simpleAdviceChatGPT = result.ask.data.advice;
                    this.isAdviceCachedChatGPT = result.ask.cached;
                }
            },
            error: (err) => {
                this.errorMessage = this.errorMessage
                    ? this.errorMessage + ' | ChatGPT: ' + err.message
                    : 'ChatGPT Error: ' + err.message;
            }
        });
    }

    private checkOverallLoadingState() {
        // Only remove main skeleton if AT LEAST ONE AI has returned its main Insight, 
        // OR both have fully finished loading (even if they failed).
        if ((!this.isGeminiLoading || !this.isChatGPTLoading) || (this.insightGemini || this.insightChatGPT)) {
            this.isLoading = false;
        }
    }

    openAdviceModal(aiProvider: 'gemini' | 'chatgpt') {
        this.activeAdviceHtml = aiProvider === 'gemini' ? this.simpleAdviceGemini! : this.simpleAdviceChatGPT!;
        this.activeAdviceIsCached = aiProvider === 'gemini' ? this.isAdviceCachedGemini : this.isAdviceCachedChatGPT;
        this.activeAdviceTitle = aiProvider === 'gemini' ? "Gemini Strategy Breakdown" : "ChatGPT Strategy Breakdown";
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
        this.activeAdviceHtml = '';
    }

    onDelete() {
        // Ensure at least one insight exists before deleting
        if (!this.insightGemini && !this.insightChatGPT) return;

        const rawTicker = this.optionForm.value.ticker.toUpperCase();
        const match = rawTicker.match(/\\(([^)]+)\\)/);
        const ticker = match ? match[1] : rawTicker;

        this.isDeleting = true;
        this.cdr.markForCheck();

        // Delete from both backend services
        forkJoin([
            this.optionsService.deleteOption(ticker),
            this.optionsService.deleteOptionChatGPT(ticker)
        ])
            .pipe(
                finalize(() => {
                    this.isDeleting = false;
                    this.cdr.markForCheck();
                })
            )
            .subscribe({
                next: () => {
                    this.insightGemini = null;
                    this.simpleAdviceGemini = null;
                    this.isAdviceCachedGemini = false;

                    this.insightChatGPT = null;
                    this.simpleAdviceChatGPT = null;
                    this.isAdviceCachedChatGPT = false;

                    this.optionForm.reset();
                },
                error: (err) => {
                    this.errorMessage = err.message || 'Failed to delete records.';
                }
            });
    }
}
