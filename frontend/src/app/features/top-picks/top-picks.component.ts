import { Component, OnInit } from '@angular/core';
import { TopPicksService, TopPicksResponse } from './top-picks.service';
import { SecureStorageService } from '../../core/services/secure-storage.service';

interface AIState {
  name: string;
  id: 'gemini' | 'chatgpt' | 'claude' | 'deepseek';
  status: 'idle' | 'loading' | 'success' | 'error';
  data: TopPicksResponse | null;
  errorMsg: string;
}

@Component({
  selector: 'app-top-picks',
  templateUrl: './top-picks.component.html',
  styleUrls: ['./top-picks.component.css']
})
export class TopPicksComponent implements OnInit {

  aiEngines: AIState[] = [
    { name: 'Google Gemini 2.5', id: 'gemini', status: 'idle', data: null, errorMsg: '' },
    { name: 'OpenAI ChatGPT 4o', id: 'chatgpt', status: 'idle', data: null, errorMsg: '' },
    { name: 'Anthropic Claude 3.5', id: 'claude', status: 'idle', data: null, errorMsg: '' },
    { name: 'DeepSeek V3', id: 'deepseek', status: 'idle', data: null, errorMsg: '' }
  ];

  isGlobalLoading = false;
  availableDates: string[] = [];
  selectedDate: string | null = null;

  constructor(private topPicksService: TopPicksService, private secureStorage: SecureStorageService) { }

  ngOnInit(): void {
    this.fetchAvailableDates();
  }

  fetchAvailableDates() {
    this.topPicksService.getAvailableDates().subscribe({
      next: (res) => {
        if (res.success && res.dates) {
          const todayStr = new Date().toISOString().split('T')[0];
          // Filter out today if it's there so we use "Live Scan" option
          this.availableDates = res.dates.filter(d => d !== todayStr);
        }
      },
      error: (err) => console.error('Failed to load dates', err)
    });
  }

  onDateChange() {
      // Clear current UI state but don't auto-fetch unless desired. User clicks the button to fetch.
      this.aiEngines.forEach(engine => {
          engine.status = 'idle';
          engine.data = null;
      });
  }

  runMasterScan() {
    this.isGlobalLoading = true;
    const targetDateStr = this.selectedDate || new Date().toISOString().split('T')[0];
    
    this.aiEngines.forEach(engine => {
      engine.status = 'loading';
      engine.errorMsg = '';
      
      const cacheKey = `topPicks_${engine.id}`;
      const cachedEntry = this.secureStorage.getItem(cacheKey);

      if (cachedEntry && cachedEntry.date === targetDateStr) {
        engine.data = cachedEntry.data;
        engine.status = 'success';
        this.checkGlobalLoading();
        return;
      }

      this.topPicksService.getTopPicks(engine.id, this.selectedDate || undefined).subscribe({
        next: (res) => {
          engine.data = res;
          engine.status = 'success';
          this.secureStorage.setItem(cacheKey, { date: targetDateStr, data: res });
          this.checkGlobalLoading();
        },
        error: (err) => {
          engine.status = 'error';
          engine.errorMsg = err.error?.error || 'Intelligence Generation Failed.';
          engine.data = null;
          this.checkGlobalLoading();
        }
      });
    });
  }

  checkGlobalLoading() {
    const stillLoading = this.aiEngines.some(e => e.status === 'loading');
    if (!stillLoading) {
      this.isGlobalLoading = false;
    }
  }
}
