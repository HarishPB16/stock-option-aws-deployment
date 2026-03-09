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

  // Claude Data
  @Input() insightClaude: any;
  @Input() simpleAdviceClaude: string | null = null;
  @Input() isAdviceCachedClaude: boolean = false;
  @Input() isClaudeLoading: boolean = false;

  // DeepSeek Data
  @Input() insightDeepSeek: any;
  @Input() simpleAdviceDeepSeek: string | null = null;
  @Input() isAdviceCachedDeepSeek: boolean = false;
  @Input() isDeepSeekLoading: boolean = false;

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

  openFullDetailsModal(aiProvider: 'gemini' | 'chatgpt' | 'claude' | 'deepseek') {
    if (aiProvider === 'gemini') {
      this.activeInsight = this.insightGemini;
      this.activeInsightTitle = "Gemini Comprehensive Diagnostics";
    } else if (aiProvider === 'chatgpt') {
      this.activeInsight = this.insightChatGPT;
      this.activeInsightTitle = "ChatGPT Comprehensive Diagnostics";
    } else if (aiProvider === 'claude') {
      this.activeInsight = this.insightClaude;
      this.activeInsightTitle = "Claude Comprehensive Diagnostics";
    } else if (aiProvider === 'deepseek') {
      this.activeInsight = this.insightDeepSeek;
      this.activeInsightTitle = "DeepSeek Comprehensive Diagnostics";
    }
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


