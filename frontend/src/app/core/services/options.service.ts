import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OptionInsight {
    action: 'CALL' | 'PUT';
    confidence: number;
    risk: string;
    support: number;
    resistance: number;
    pe: number;
    industryPe: number;
    averagePe5Yr: number;
    trend: string;
    newsSummary: { text: string; color: string };
    analysis: { text: string; color: string };
    forecast1Year: { text: string; color: string };
    tomorrowRange: string;
    emaAnalysis: { text: string; color: string };
    rsiAnalysis: { text: string; color: string };
    vixThetaAnalysis: { text: string; color: string };
    supportResistanceAnalysis: string;
    verdict: { text: string; color: string };
}

export interface OptionResponse {
    success: boolean;
    data: {
        ticker: string;
        insight: OptionInsight;
        recordId: string;
    };
    error?: any;
}

export interface SimpleAdviceResponse {
    success: boolean;
    cached: boolean;
    data: {
        ticker: string;
        advice: string;
        date: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class OptionsService {
    private apiUrl = `${environment.apiUrl}/options`;

    constructor(private http: HttpClient) { }

    suggestOption(ticker: string): Observable<OptionResponse> {
        return this.http.post<OptionResponse>(`${environment.apiUrl}/options/suggest`, { ticker });
    }

    askOption(ticker: string): Observable<SimpleAdviceResponse> {
        return this.http.post<SimpleAdviceResponse>(`${environment.apiUrl}/options/ask`, { ticker });
    }

    deleteOption(ticker: string): Observable<any> {
        return this.http.delete(`${environment.apiUrl}/options/${ticker}`);
    }

    getHistoryByDate(date: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}/options/history?date=${date}`);
    }

    // --- ChatGPT Endpoints ---

    suggestOptionChatGPT(ticker: string): Observable<OptionResponse> {
        return this.http.post<OptionResponse>(`${environment.apiUrl}/chatgpt/options/suggest`, { ticker });
    }

    askOptionChatGPT(ticker: string): Observable<SimpleAdviceResponse> {
        return this.http.post<SimpleAdviceResponse>(`${environment.apiUrl}/chatgpt/options/ask`, { ticker });
    }

    deleteOptionChatGPT(ticker: string): Observable<any> {
        return this.http.delete(`${environment.apiUrl}/chatgpt/options/${ticker}`);
    }

    getHistoryByDateChatGPT(date: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}/chatgpt/options/history?date=${date}`);
    }

    getMarketBriefingChatGPT(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/chatgpt/market/briefing`);
    }
}
