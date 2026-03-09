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

    // Claude State
    isClaudeLoading = false;
    insightClaude: OptionInsight | null = null;
    simpleAdviceClaude: string | null = null;
    isAdviceCachedClaude: boolean = false;

    // DeepSeek State
    isDeepSeekLoading = false;
    insightDeepSeek: OptionInsight | null = null;
    simpleAdviceDeepSeek: string | null = null;
    isAdviceCachedDeepSeek: boolean = false;

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

        this.insightClaude = null;
        this.simpleAdviceClaude = null;
        this.isAdviceCachedClaude = false;
        this.isClaudeLoading = true;

        this.insightDeepSeek = null;
        this.simpleAdviceDeepSeek = null;
        this.isAdviceCachedDeepSeek = false;
        this.isDeepSeekLoading = true;

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

        // 3. Fire Claude Requests concurrently
        forkJoin({
            suggest: this.optionsService.suggestOptionClaude(queryTicker),
            ask: this.optionsService.askOptionClaude(queryTicker)
        }).pipe(
            finalize(() => {
                this.isClaudeLoading = false;
                this.checkOverallLoadingState();
                this.cdr.markForCheck();
            })
        ).subscribe({
            next: (result) => {
                if (result.suggest.success && result.suggest.data) {
                    this.insightClaude = result.suggest.data.insight;
                }
                if (result.ask.success && result.ask.data) {
                    this.simpleAdviceClaude = result.ask.data.advice;
                    this.isAdviceCachedClaude = result.ask.cached;
                }
            },
            error: (err) => {
                this.errorMessage = this.errorMessage
                    ? this.errorMessage + ' | Claude: ' + err.message
                    : 'Claude Error: ' + err.message;
            }
        });

        // 4. Fire DeepSeek Requests concurrently
        forkJoin({
            suggest: this.optionsService.suggestOptionDeepSeek(queryTicker),
            ask: this.optionsService.askOptionDeepSeek(queryTicker)
        }).pipe(
            finalize(() => {
                this.isDeepSeekLoading = false;
                this.checkOverallLoadingState();
                this.cdr.markForCheck();
            })
        ).subscribe({
            next: (result) => {
                if (result.suggest.success && result.suggest.data) {
                    this.insightDeepSeek = result.suggest.data.insight;
                }
                if (result.ask.success && result.ask.data) {
                    this.simpleAdviceDeepSeek = result.ask.data.advice;
                    this.isAdviceCachedDeepSeek = result.ask.cached;
                }
            },
            error: (err) => {
                this.errorMessage = this.errorMessage
                    ? this.errorMessage + ' | DeepSeek: ' + err.message
                    : 'DeepSeek Error: ' + err.message;
            }
        });
    }

    private checkOverallLoadingState() {
        // Only remove main skeleton if AT LEAST ONE AI has returned its main Insight, 
        // OR both have fully finished loading (even if they failed).
        if ((!this.isGeminiLoading || !this.isChatGPTLoading || !this.isClaudeLoading || !this.isDeepSeekLoading) ||
            (this.insightGemini || this.insightChatGPT || this.insightClaude || this.insightDeepSeek)) {
            this.isLoading = false;
        }
    }

    openAdviceModal(aiProvider: 'gemini' | 'chatgpt' | 'claude' | 'deepseek') {
        if (aiProvider === 'gemini') {
            this.activeAdviceHtml = this.simpleAdviceGemini!;
            this.activeAdviceIsCached = this.isAdviceCachedGemini;
            this.activeAdviceTitle = "Gemini Strategy Breakdown";
        } else if (aiProvider === 'chatgpt') {
            this.activeAdviceHtml = this.simpleAdviceChatGPT!;
            this.activeAdviceIsCached = this.isAdviceCachedChatGPT;
            this.activeAdviceTitle = "ChatGPT Strategy Breakdown";
        } else if (aiProvider === 'claude') {
            this.activeAdviceHtml = this.simpleAdviceClaude!;
            this.activeAdviceIsCached = this.isAdviceCachedClaude;
            this.activeAdviceTitle = "Claude Strategy Breakdown";
        } else if (aiProvider === 'deepseek') {
            this.activeAdviceHtml = this.simpleAdviceDeepSeek!;
            this.activeAdviceIsCached = this.isAdviceCachedDeepSeek;
            this.activeAdviceTitle = "DeepSeek Strategy Breakdown";
        }
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

        // Delete from all backend services
        forkJoin([
            this.optionsService.deleteOption(ticker),
            this.optionsService.deleteOptionChatGPT(ticker),
            this.optionsService.deleteOptionClaude(ticker),
            this.optionsService.deleteOptionDeepSeek(ticker)
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

                    this.insightClaude = null;
                    this.simpleAdviceClaude = null;
                    this.isAdviceCachedClaude = false;

                    this.insightDeepSeek = null;
                    this.simpleAdviceDeepSeek = null;
                    this.isAdviceCachedDeepSeek = false;

                    this.optionForm.reset();
                },
                error: (err) => {
                    this.errorMessage = err.message || 'Failed to delete records.';
                }
            });
    }
}
