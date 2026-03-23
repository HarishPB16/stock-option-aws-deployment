import { Component, OnInit } from '@angular/core';
import { TopPicksService, TopPicksResponse } from './top-picks.service';

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

  constructor(private topPicksService: TopPicksService) { }

  ngOnInit(): void {
  }

  runMasterScan() {
    this.isGlobalLoading = true;
    
    this.aiEngines.forEach(engine => {
      engine.status = 'loading';
      engine.errorMsg = '';
      
      this.topPicksService.getTopPicks(engine.id).subscribe({
        next: (res) => {
          engine.data = res;
          engine.status = 'success';
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
