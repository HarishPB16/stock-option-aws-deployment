import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OptionsService } from '../../core/services/options.service';
import { NSESecurity, NSE_STOCKS } from '../../core/data/nse-stocks.data';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-prompts',
  templateUrl: './prompts.component.html',
  styleUrls: ['./prompts.component.css']
})
export class PromptsComponent implements OnInit {
  promptForm!: FormGroup;
  generatedPrompt: string = '';
  isLoading: boolean = false;
  error: string | null = null;
  copied: boolean = false;

  promptTypes = [
    { value: 'suggestion', label: 'Option Suggestion' },
    { value: 'advice', label: 'Simple Advice' },
    { value: 'market_briefing', label: 'Market Briefing' }
  ];

  filteredStocks$!: Observable<NSESecurity[]>;
  showDropdown: boolean = false;

  constructor(
    private fb: FormBuilder,
    private optionsService: OptionsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.promptForm = this.fb.group({
      type: ['suggestion', Validators.required],
      ticker: [''],
      date: [today, Validators.required]
    });

    // Make ticker required only for suggestion and advice
    this.promptForm.get('type')?.valueChanges.subscribe(type => {
      const tickerControl = this.promptForm.get('ticker');
      if (type === 'market_briefing') {
        tickerControl?.clearValidators();
        tickerControl?.disable();
      } else {
        tickerControl?.setValidators([Validators.required]);
        tickerControl?.enable();
      }
      tickerControl?.updateValueAndValidity();
    });

    this.filteredStocks$ = this.promptForm.get('ticker')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );
  }

  private _filter(value: string): NSESecurity[] {
    const filterValue = value.toLowerCase();
    if (!filterValue) return [];
    return NSE_STOCKS.filter(stock =>
      stock.name.toLowerCase().includes(filterValue) ||
      stock.ticker.toLowerCase().includes(filterValue)
    );
  }

  selectStock(stock: NSESecurity): void {
    this.promptForm.get('ticker')?.setValue(`${stock.name} (${stock.ticker})`);
    this.showDropdown = false;
  }

  onFocus(): void {
    this.showDropdown = true;
  }

  onBlur(): void {
    setTimeout(() => {
      this.showDropdown = false;
      this.cdr.markForCheck();
    }, 200);
  }

  onSubmit(): void {
    if (this.promptForm.invalid) return;

    this.isLoading = true;
    this.error = null;
    this.generatedPrompt = '';
    this.copied = false;

    // Extract raw ticker text
    let queryTicker = this.promptForm.value.ticker;
    if (this.promptForm.value.type !== 'market_briefing' && queryTicker) {
      const match = queryTicker.match(/\(([^)]+)\)/);
      queryTicker = match ? match[1] : queryTicker;
    }

    const payload = { ...this.promptForm.value, ticker: queryTicker };

    this.optionsService.generatePrompt(payload).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.generatedPrompt = res.data.prompt;
        } else {
          this.error = res.message || 'Error generating prompt';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to generate prompt';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  copyToClipboard(): void {
    if (!this.generatedPrompt) return;
    navigator.clipboard.writeText(this.generatedPrompt).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    }).catch(err => {
      console.error('Failed to copy', err);
    });
  }

  openAIs(): void {
    // Note: Most browsers will block multiple window.open calls triggered from a single click 
    // as a spam popup protection measure. The user will likely need to allow popups in their browser 
    // for localhost to see all three tabs open simultaneously.
    window.open('https://chat.deepseek.com/', '_blank');

    setTimeout(() => {
      window.open('https://gemini.google.com/app?hl=en-IN', '_blank');
    }, 100);

    setTimeout(() => {
      window.open('https://chatgpt.com/', '_blank');
    }, 200);
  }
}
