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
    trend: string;
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

@Injectable({
    providedIn: 'root'
})
export class OptionsService {
    private apiUrl = `${environment.apiUrl}/options`;

    constructor(private http: HttpClient) { }

    suggestOption(ticker: string): Observable<OptionResponse> {
        return this.http.post<OptionResponse>(`${this.apiUrl}/suggest`, { ticker });
    }
}
