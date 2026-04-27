import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TradeSetupRequest {
  indexName: string;
  aiService: string;
}

export interface TradeSetupResponse {
  success: boolean;
  data?: {
    indexName: string;
    aiService: string;
    setupHtml: string;
  };
  error?: {
    message: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TradeSetupService {
  private apiUrl = `${environment.apiUrl}/trade`;

  constructor(private http: HttpClient) { }

  generateTradeSetup(payload: TradeSetupRequest): Observable<TradeSetupResponse> {
    return this.http.post<TradeSetupResponse>(`${this.apiUrl}/setup`, payload);
  }
}
