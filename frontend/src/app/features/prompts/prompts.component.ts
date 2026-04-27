import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SecureStorageService } from '../../core/services/secure-storage.service';
import { OptionsService } from '../../core/services/options.service';
import { NSESecurity, NSE_STOCKS } from '../../core/data/nse-stocks.data';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-prompts',
  templateUrl: './prompts.component.html',
  styleUrls: ['./prompts.component.css']
})
export class PromptsComponent implements OnInit {
  promptForm!: FormGroup;
  loginForm!: FormGroup;

  generatedPrompt: string = '';
  isLoading: boolean = false;
  error: string | null = null;
  copied: boolean = false;

  // Authentication state
  isAuthenticated: boolean = false;
  loginError: string | null = null;
  // A simulated encrypted value for "Aws@16" using secret "admin_secret".
  // Generated via CryptoJS.AES.encrypt('Aws@16', 'admin_secret').toString()
  private encryptedAdminPass = 'U2FsdGVkX1/PDGD/RNA7t8qSc2uWJ38PeML1BehNsKs=';
  private secretKey = 'admin_secret';

  // Admin Sub-Menu State
  activeAdminTab: 'prompt' | 'study' | 'iq' | 'content' | 'category' | 'calculator' = 'prompt';

  switchAdminTab(tab: 'prompt' | 'study' | 'iq' | 'content' | 'category' | 'calculator'): void {
    this.activeAdminTab = tab;
  }

  promptTypes = [
    { value: 'suggestion', label: 'Option Suggestion' },
    { value: 'advice', label: 'Simple Advice' },
    { value: 'market_briefing', label: 'Market Briefing' },
    { value: 'top_picks', label: 'Top Picks' },
    { value: 'trade_setup', label: 'Trade Setup' }
  ];

  indexOptions = ['NIFTY 50', 'SENSEX', 'BANK NIFTY'];

  filteredStocks$!: Observable<NSESecurity[]>;
  showDropdown: boolean = false;

  constructor(
    private fb: FormBuilder,
    private optionsService: OptionsService,
    private cdr: ChangeDetectorRef,
    private secureStorage: SecureStorageService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAdmin;
    const today = new Date().toISOString().split('T')[0];

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.promptForm = this.fb.group({
      type: ['suggestion', Validators.required],
      ticker: [''],
      indexName: ['NIFTY 50'],
      date: [{ value: today, disabled: true }, Validators.required]
    });

    // Make ticker required only for suggestion and advice
    this.promptForm.get('type')?.valueChanges.subscribe(type => {
      const tickerControl = this.promptForm.get('ticker');
      const indexControl = this.promptForm.get('indexName');

      if (type === 'market_briefing' || type === 'top_picks') {
        tickerControl?.clearValidators();
        tickerControl?.disable();
        indexControl?.disable();
      } else if (type === 'trade_setup') {
        tickerControl?.clearValidators();
        tickerControl?.disable();
        indexControl?.setValidators([Validators.required]);
        indexControl?.enable();
      } else {
        tickerControl?.setValidators([Validators.required]);
        tickerControl?.enable();
        indexControl?.disable();
      }
      tickerControl?.updateValueAndValidity();
      indexControl?.updateValueAndValidity();
    });

    this.filteredStocks$ = this.promptForm.get('ticker')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );

    const cachedPromptData = this.secureStorage.getItem('promptData');
    if (cachedPromptData) {
      if (cachedPromptData.generatedPrompt) {
        this.generatedPrompt = cachedPromptData.generatedPrompt;
      }
      if (cachedPromptData.formValue) {
        this.promptForm.patchValue(cachedPromptData.formValue);
      }
    }
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;

    this.loginError = null;
    const { username, password } = this.loginForm.value;

    if (username !== 'harishpb') {
      this.loginError = 'Invalid username or password';
      return;
    }

    try {
      const bytes = CryptoJS.AES.decrypt(this.encryptedAdminPass, this.secretKey);
      const decryptedPass = bytes.toString(CryptoJS.enc.Utf8);
      if (password === decryptedPass) {
        this.isAuthenticated = true;
        this.authService.setAdminAuth(true);
      } else {
        this.loginError = 'Invalid username or password';
      }
    } catch (e) {
      this.loginError = 'Authentication failed';
    }
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
    if (this.promptForm.value.type === 'trade_setup') {
        queryTicker = this.promptForm.getRawValue().indexName;
    } else if (this.promptForm.value.type !== 'market_briefing' && this.promptForm.value.type !== 'top_picks' && queryTicker) {
      const match = queryTicker.match(/\(([^)]+)\)/);
      queryTicker = match ? match[1] : queryTicker;
    }

    // Since 'date' is disabled, it won't be in this.promptForm.value, we must use getRawValue() or just grab the value
    const todayStr = new Date().toISOString().split('T')[0];
    const payload = { ...this.promptForm.value, ticker: queryTicker, date: todayStr };

    this.optionsService.generatePrompt(payload).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.generatedPrompt = res.data.prompt;
          this.secureStorage.setItem('promptData', {
            generatedPrompt: this.generatedPrompt,
            formValue: this.promptForm.value
          });
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

    // Modern approach (requires secure context like HTTPS or localhost)
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(this.generatedPrompt).then(() => {
        this.setCopiedState();
      }).catch(err => {
        console.warn('Clipboard API failed, attempting fallback...', err);
        this.fallbackCopyTextToClipboard(this.generatedPrompt);
      });
    } else {
      // Fallback approach for insecure environments (HTTP IP addresses)
      this.fallbackCopyTextToClipboard(this.generatedPrompt);
    }
  }

  private fallbackCopyTextToClipboard(text: string): void {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.setCopiedState();
      } else {
        console.error('Fallback: Copying text command was unsuccessful');
      }
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
  }

  private setCopiedState(): void {
    this.copied = true;
    setTimeout(() => {
      this.copied = false;
      this.cdr.markForCheck();
    }, 2000);
  }

  openAIs(): void {
    // Note: Most browsers will block multiple window.open calls triggered from a single click 
    // as a spam popup protection measure. The user will likely need to allow popups in their browser 
    // for localhost to see all three tabs open simultaneously.
    // window.open('https://chat.deepseek.com/', '_blank');

    setTimeout(() => {
      window.open('https://gemini.google.com/app?hl=en-IN', '_blank');
    }, 100);

    setTimeout(() => {
      window.open('https://chatgpt.com/', '_blank');
    }, 200);

    setTimeout(() => {
      window.open('https://grok.com/', '_blank');
    }, 300);
  }

  clearPromptCache(): void {
    this.secureStorage.removeItem('promptData');
    this.generatedPrompt = '';
    this.promptForm.reset({
      type: 'suggestion',
      ticker: '',
      indexName: 'NIFTY 50',
      date: new Date().toISOString().split('T')[0]
    });
    // Ensure date stays disabled after reset
    this.promptForm.get('date')?.disable();
  }
}
