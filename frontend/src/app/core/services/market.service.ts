import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MarketBriefingResponse {
    success: boolean;
    data: {
        dateKey: string;
        htmlContent: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class MarketService {
    private apiUrl = `${environment.apiUrl}/market`;

    constructor(private http: HttpClient) { }

    getDailyBriefing(): Observable<MarketBriefingResponse> {
        return this.http.get<MarketBriefingResponse>(`${this.apiUrl}/briefing`);
    }

    refreshDailyBriefing(): Observable<MarketBriefingResponse> {
        return this.http.post<MarketBriefingResponse>(`${this.apiUrl}/briefing/refresh`, {});
    }
}
