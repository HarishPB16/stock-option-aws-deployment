import { Component, OnInit } from '@angular/core';
import { OptionsService } from '../../core/services/options.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})
export class HistoryComponent implements OnInit {
  selectedDate: string = '';
  isLoading = false;
  historyData: any = null;
  errorMessage: string | null = null;

  constructor(private optionsService: OptionsService) {
    // default to today
    this.selectedDate = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.fetchHistory();
  }

  isGeminiLoading = false;
  isChatGPTLoading = false;
  isClaudeLoading = false;
  isDeepSeekLoading = false;

  fetchHistory() {
    if (!this.selectedDate) return;

    this.isLoading = true;
    this.isGeminiLoading = true;
    this.isChatGPTLoading = true;
    this.isClaudeLoading = true;
    this.isDeepSeekLoading = true;
    this.errorMessage = null;
    this.historyData = { options: [] }; // Combined array

    // 1. Fetch Gemini History
    this.optionsService
      .getHistoryByDate(this.selectedDate)
      .pipe(
        finalize(() => {
          this.isGeminiLoading = false;
          this.checkLoadingState();
        }),
      )
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.mergeIntoHistory('gemini', res.data.options, res.data.advice);
          }
        },
        error: (err) => {
          console.error('Gemini History Error', err);
        },
      });

    // 2. Fetch ChatGPT History
    this.optionsService
      .getHistoryByDateChatGPT(this.selectedDate)
      .pipe(
        finalize(() => {
          this.isChatGPTLoading = false;
          this.checkLoadingState();
        }),
      )
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.mergeIntoHistory('chatgpt', res.data.options, res.data.advice);
          }
        },
        error: (err) => {
          console.error('ChatGPT History Error', err);
        },
      });
    // 3. Fetch Claude History
    this.optionsService
      .getHistoryByDateClaude(this.selectedDate)
      .pipe(
        finalize(() => {
          this.isClaudeLoading = false;
          this.checkLoadingState();
        }),
      )
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.mergeIntoHistory('claude', res.data.options, res.data.advice);
          }
        },
        error: (err) => {
          console.error('Claude History Error', err);
        },
      });

    // 4. Fetch DeepSeek History
    this.optionsService
      .getHistoryByDateDeepSeek(this.selectedDate)
      .pipe(
        finalize(() => {
          this.isDeepSeekLoading = false;
          this.checkLoadingState();
        }),
      )
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.mergeIntoHistory(
              'deepseek',
              res.data.options,
              res.data.advice,
            );
          }
        },
        error: (err) => {
          console.error('DeepSeek History Error', err);
        },
      });
  }

  checkLoadingState() {
    if (
      !this.isGeminiLoading &&
      !this.isChatGPTLoading &&
      !this.isClaudeLoading &&
      !this.isDeepSeekLoading
    ) {
      this.isLoading = false;
    }
  }

  mergeIntoHistory(
    aiProvider: 'gemini' | 'chatgpt' | 'claude' | 'deepseek',
    options: any[],
    adviceList: any[],
  ) {
    if (!options) return;

    options.forEach((opt) => {
      const matchingAdvice = adviceList?.find(
        (a: any) => a.stock === opt.stock,
      );

      // Find if stock already exists in combined historyData
      let existingRecord = this.historyData.options.find(
        (item: any) => item.stock === opt.stock,
      );

      if (!existingRecord) {
        existingRecord = { stock: opt.stock, createdAt: opt.createdAt };
        this.historyData.options.push(existingRecord);
      }

      if (aiProvider === 'gemini') {
        existingRecord.insightGemini = opt;
        existingRecord.simpleAdviceGemini = matchingAdvice
          ? matchingAdvice.advice
          : null;
      } else if (aiProvider === 'chatgpt') {
        existingRecord.insightChatGPT = opt;
        existingRecord.simpleAdviceChatGPT = matchingAdvice
          ? matchingAdvice.advice
          : null;
      } else if (aiProvider === 'claude') {
        existingRecord.insightClaude = opt;
        existingRecord.simpleAdviceClaude = matchingAdvice
          ? matchingAdvice.advice
          : null;
      } else if (aiProvider === 'deepseek') {
        existingRecord.insightDeepSeek = opt;
        existingRecord.simpleAdviceDeepSeek = matchingAdvice
          ? matchingAdvice.advice
          : null;
      }
    });
  }

  isDeleting: { [ticker: string]: boolean } = {};

  deleteOption(ticker: string) {
    if (!ticker) return;

    this.isDeleting[ticker] = true;

    // Fire delete requests simultaneously without waiting
    this.optionsService.deleteOption(ticker).subscribe({
      error: (err) => console.error(err),
    });

    this.optionsService.deleteOptionChatGPT(ticker).subscribe({
      error: (err) => console.error(err),
    });

    this.optionsService.deleteOptionClaude(ticker).subscribe({
      error: (err) => console.error(err),
    });

    this.optionsService.deleteOptionDeepSeek(ticker).subscribe({
      error: (err) => console.error(err),
    });

    // Set a brief arbitrary timeout before refetching to allow DB ops to finish since we aren't joining
    setTimeout(() => {
      this.isDeleting[ticker] = false;
      this.fetchHistory();
    }, 1000);
  }
}
