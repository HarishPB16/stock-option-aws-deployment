import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-option-stock-detail',
  templateUrl: './option-stock-detail.component.html',
  styleUrls: ['./option-stock-detail.component.css']
})
export class OptionStockDetailComponent {
  // Gemini Data
  @Input() insightGemini: any;
  @Input() simpleAdviceGemini: string | null = null;
  @Input() isAdviceCachedGemini: boolean = false;
  @Input() isGeminiLoading: boolean = false;

  // ChatGPT Data
  @Input() insightChatGPT: any;
  @Input() simpleAdviceChatGPT: string | null = null;
  @Input() isAdviceCachedChatGPT: boolean = false;
  @Input() isChatGPTLoading: boolean = false;

  @Input() isDeleting: boolean = false;

  @Output() deleteData = new EventEmitter<void>();

  showAdviceModal: boolean = false;
  showForecastModal: boolean = false;
  showFullDetailsModal: boolean = false;

  activeForecastText: string = '';
  activeAdviceHtml: string = '';
  activeAdviceIsCached: boolean = false;
  activeAdviceTitle: string = '';
  activeInsight: any = null;
  activeInsightTitle: string = '';

  onDelete() {
    this.deleteData.emit();
  }

  openAdviceModal(aiProvider: 'gemini' | 'chatgpt') {
    this.activeAdviceHtml = aiProvider === 'gemini' ? this.simpleAdviceGemini! : this.simpleAdviceChatGPT!;
    this.activeAdviceIsCached = aiProvider === 'gemini' ? this.isAdviceCachedGemini : this.isAdviceCachedChatGPT;
    this.activeAdviceTitle = aiProvider === 'gemini' ? "Gemini Strategy Breakdown" : "ChatGPT Strategy Breakdown";
    this.showAdviceModal = true;
  }

  openFullDetailsModal(aiProvider: 'gemini' | 'chatgpt') {
    this.activeInsight = aiProvider === 'gemini' ? this.insightGemini : this.insightChatGPT;
    this.activeInsightTitle = aiProvider === 'gemini' ? "Gemini Comprehensive Diagnostics" : "ChatGPT Comprehensive Diagnostics";
    this.showFullDetailsModal = true;
  }

  openForecastModal(text: string) {
    this.activeForecastText = text;
    this.showForecastModal = true;
  }

  closeModals() {
    this.showAdviceModal = false;
    this.showForecastModal = false;
    this.showFullDetailsModal = false;
    this.activeForecastText = '';
    this.activeAdviceHtml = '';
    this.activeInsight = null;
  }
}


