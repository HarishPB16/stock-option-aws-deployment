import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-option-stock-detail',
  templateUrl: './option-stock-detail.component.html',
  styleUrls: ['./option-stock-detail.component.css']
})
export class OptionStockDetailComponent {
  @Input() insight: any;
  @Input() simpleAdvice: string | null = null;
  @Input() isAdviceCached: boolean = false;
  @Input() isDeleting: boolean = false;

  @Output() deleteData = new EventEmitter<void>();

  showAdviceModal: boolean = false;
  showForecastModal: boolean = false;
  showFullDetailsModal: boolean = false;
  activeForecastText: string = '';

  onDelete() {
    this.deleteData.emit();
  }

  openAdviceModal() {
    this.showAdviceModal = true;
  }

  openFullDetailsModal() {
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
  }
}
