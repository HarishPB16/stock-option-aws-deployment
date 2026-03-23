import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OptionPick {
  ticker: string;
  strike: string;
  expiry: string;
  premium: string;
  reason: string;
}

export interface TopPicksResponse {
  calls: OptionPick[];
  puts: OptionPick[];
}

@Injectable({
  providedIn: 'root'
})
export class TopPicksService {
  private apiUrl = `${environment.apiUrl}/recommendations`;

  constructor(private http: HttpClient) { }

  getTopPicks(ai: 'gemini' | 'chatgpt' | 'claude' | 'deepseek'): Observable<TopPicksResponse> {
    return this.http.get<TopPicksResponse>(`${this.apiUrl}/top-picks?ai=${ai}`);
  }
}
