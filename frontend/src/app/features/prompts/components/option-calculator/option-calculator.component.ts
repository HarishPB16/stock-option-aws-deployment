import { Component } from '@angular/core';

@Component({
  selector: 'app-option-calculator',
  templateUrl: './option-calculator.component.html',
  styleUrls: ['./option-calculator.component.css']
})
export class OptionCalculatorComponent {

  price: number | null = null;

  profitPercents: number[] = Array.from({ length: 28 }, (_, i) => i + 2); // 2 to 30
  stopLossPercents: number[] = [25, 50, 80];

  selectedProfit: number = 3;
  selectedStopLoss: number = 25;

  targetPrice: number = 0;
  stopLossPrice: number = 0;

  calculate() {
    if (!this.price) {
      this.targetPrice = 0;
      this.stopLossPrice = 0;
      return;
    }

    this.targetPrice = this.price + (this.price * this.selectedProfit / 100);
    this.stopLossPrice = this.price - (this.price * this.selectedStopLoss / 100);
  }
}
