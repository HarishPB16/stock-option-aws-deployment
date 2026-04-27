import { Component, OnInit } from '@angular/core';
import { TradeSetupService } from './trade-setup.service';

@Component({
  selector: 'app-trade-setup',
  templateUrl: './trade-setup.component.html',
  styleUrls: ['./trade-setup.component.css']
})
export class TradeSetupComponent implements OnInit {
  indexOptions = ['NIFTY 50', 'SENSEX', 'BANK NIFTY'];
  selectedIndex = 'NIFTY 50';

  aiOptions = [
    { id: 'gemini', label: 'Gemini' },
    { id: 'chatgpt', label: 'ChatGPT' },
    { id: 'claude', label: 'Claude AI' }
  ];
  selectedAi = 'gemini';

  isLoading = false;
  setupResultHtml: string | null = null;
  errorMessage: string | null = null;

  constructor(private tradeSetupService: TradeSetupService) {}

  ngOnInit(): void {
  }

  generateTradeSetup() {
    this.isLoading = true;
    this.setupResultHtml = null;
    this.errorMessage = null;

    this.tradeSetupService.generateTradeSetup({
      indexName: this.selectedIndex,
      aiService: this.selectedAi
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          this.setupResultHtml = res.data.setupHtml;
        } else {
          this.errorMessage = res.error?.message || 'Failed to generate trade setup.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred while communicating with the server.';
        console.error(err);
      }
    });
  }
}
