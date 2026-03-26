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
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TopPicksService {
  private apiUrl = `${environment.apiUrl}/recommendations`;

  constructor(private http: HttpClient) { }

  getAvailableDates(): Observable<{ success: boolean; dates: string[] }> {
    return this.http.get<{ success: boolean; dates: string[] }>(`${this.apiUrl}/dates`);
  }

  getTopPicks(ai: 'gemini' | 'chatgpt' | 'claude' | 'deepseek', dateKey?: string): Observable<TopPicksResponse> {
    let url = `${this.apiUrl}/top-picks?ai=${ai}`;
    if (dateKey) {
        url += `&date=${dateKey}`;
    }
    return this.http.get<TopPicksResponse>(url);
  }
}
