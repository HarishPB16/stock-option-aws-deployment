import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VideoResponse } from '../models/video.model';

@Injectable({
    providedIn: 'root'
})
export class VideoService {
    private apiUrl = `${environment.apiUrl}/videos`;

    constructor(private http: HttpClient) { }

    addVideo(url: string, title?: string): Observable<VideoResponse> {
        return this.http.post<VideoResponse>(this.apiUrl, { url, title });
    }

    getRandomVideos(): Observable<VideoResponse> {
        return this.http.get<VideoResponse>(`${this.apiUrl}/random`);
    }
}
