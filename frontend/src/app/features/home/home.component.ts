import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MarketService } from '../../core/services/market.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  briefingHtml: SafeHtml | null = null;
  isLoading: boolean = true;
  isRefreshing: boolean = false;
  error: string | null = null;

  constructor(
    private marketService: MarketService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.fetchBriefing();
  }

  fetchBriefing(): void {
    this.isLoading = true;
    this.error = null;
    this.marketService.getDailyBriefing().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.briefingHtml = this.sanitizer.bypassSecurityTrustHtml(res.data.htmlContent);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.error?.message || 'Failed to load market briefing.';
        this.isLoading = false;
      }
    });
  }

  refreshBriefing(): void {
    this.isRefreshing = true;
    this.error = null;
    this.marketService.refreshDailyBriefing().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.briefingHtml = this.sanitizer.bypassSecurityTrustHtml(res.data.htmlContent);
        }
        this.isRefreshing = false;
      },
      error: (err) => {
        this.error = err.error?.error?.message || 'Failed to refresh market briefing.';
        this.isRefreshing = false;
      }
    });
  }
}
