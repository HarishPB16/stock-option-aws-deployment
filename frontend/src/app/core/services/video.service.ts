import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VideoResponse } from '../models/video.model';

@Injectable({
    providedIn: 'root'
})
export class VideoService {
    private apiUrl = `${environment.apiUrl}/videos`;

    constructor(private http: HttpClient) { }

    addVideo(url: string, title?: string, categories?: string[]): Observable<VideoResponse> {
        return this.http.post<VideoResponse>(this.apiUrl, { url, title, categories });
    }

    getRandomVideos(category?: string): Observable<VideoResponse> {
        let params = new HttpParams();
        if (category && category !== 'All') {
            params = params.set('category', category);
        }
        return this.http.get<VideoResponse>(`${this.apiUrl}/random`, { params });
    }
}
