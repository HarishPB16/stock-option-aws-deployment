import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MarketService } from '../../core/services/market.service';
import { SecureStorageService } from '../../core/services/secure-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  briefingHtml: SafeHtml | null = null;
  isLoading: boolean = true;
  isRefreshing: boolean = false;
  createdAt: string | null = null;
  error: string | null = null;
  selectedAiProvider: 'gemini' | 'chatgpt' = 'gemini';

  constructor(
    private marketService: MarketService,
    private sanitizer: DomSanitizer,
    private secureStorage: SecureStorageService
  ) { }

  ngOnInit(): void {
    // Restore preference if exists
    const storedProvider = localStorage.getItem('preferredAiProvider');
    if (storedProvider === 'chatgpt') {
      this.selectedAiProvider = 'chatgpt';
    }

    this.fetchBriefing();
  }

  onProviderChange(event: Event): void {
    const selectEl = event.target as HTMLSelectElement;
    this.selectedAiProvider = selectEl.value as 'gemini' | 'chatgpt';
    localStorage.setItem('preferredAiProvider', this.selectedAiProvider);
    this.fetchBriefing();
  }

  fetchBriefing(): void {
    this.isLoading = true;
    this.error = null;
    this.briefingHtml = null;

    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `homeBriefing_${this.selectedAiProvider}`;
    const cachedEntry = this.secureStorage.getItem(cacheKey);

    if (cachedEntry && cachedEntry.date === today) {
      this.createdAt = cachedEntry.data.createdAt;
      this.briefingHtml = this.sanitizer.bypassSecurityTrustHtml(cachedEntry.data.htmlContent);
      this.isLoading = false;
      return;
    }

    const req$ = this.selectedAiProvider === 'gemini'
      ? this.marketService.getDailyBriefing()
      : this.marketService.getDailyBriefingChatGPT();

    req$.subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // Both APIs return the HTML in either res.data.htmlContent or res.data.briefing (as per ChatGPT controller we wrote)
          const htmlContent = (res.data as any).htmlContent || (res.data as any).briefing;
          this.createdAt = (res.data as any).createdAt || null;
          if (htmlContent) {
            this.briefingHtml = this.sanitizer.bypassSecurityTrustHtml(htmlContent);
            this.secureStorage.setItem(cacheKey, { 
              date: today, 
              data: { createdAt: this.createdAt, htmlContent: htmlContent } 
            });
          }
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.error?.message || `Failed to load ${this.selectedAiProvider} market briefing.`;
        this.isLoading = false;
      }
    });
  }

  refreshBriefing(): void {
    this.isRefreshing = true;
    this.error = null;

    // We only implemented a dedicated force refresh route for Gemini.
    // However, the ChatGPT GET route has no TTL cache, it always generates if not in DB.
    // If we want to strictly 'refresh', we'd need a backend route to delete today's ChatGpt briefing first.
    // For now, we utilize the specific refresh for Gemini, or re-fetch for ChatGPT.
    const req$ = this.selectedAiProvider === 'gemini'
      ? this.marketService.refreshDailyBriefing()
      : this.marketService.getDailyBriefingChatGPT();

    req$.subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const htmlContent = (res.data as any).htmlContent || (res.data as any).briefing;
          this.createdAt = (res.data as any).createdAt || null;
          if (htmlContent) {
            this.briefingHtml = this.sanitizer.bypassSecurityTrustHtml(htmlContent);
            const today = new Date().toISOString().split('T')[0];
            const cacheKey = `homeBriefing_${this.selectedAiProvider}`;
            this.secureStorage.setItem(cacheKey, { 
              date: today, 
              data: { createdAt: this.createdAt, htmlContent: htmlContent } 
            });
          }
        }
        this.isRefreshing = false;
      },
      error: (err) => {
        this.error = err.error?.error?.message || `Failed to refresh ${this.selectedAiProvider} market briefing.`;
        this.isRefreshing = false;
      }
    });
  }
}
