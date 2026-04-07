import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SecureStorageService } from './secure-storage.service';

export interface Game {
    id?: string;
    name: string;
    url: string;
    description: string;
    createdAt?: string;
}

export interface GameResponse {
    success: boolean;
    data: Game | Game[];
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class GameService {
    private apiUrl = `${environment.apiUrl}/games`;
    private storageKey = 'SECURE_GAMES_CACHE';

    constructor(
        private http: HttpClient,
        private secureStorage: SecureStorageService
    ) {}

    getGames(forceRefresh: boolean = false): Observable<Game[]> {
        if (!forceRefresh) {
            const cachedGames = this.secureStorage.getItem(this.storageKey);
            if (cachedGames && cachedGames.length > 0) {
                return of(cachedGames);
            }
        }

        return this.http.get<{ success: boolean; data: Game[] }>(this.apiUrl).pipe(
            map(res => res.data || []),
            tap(games => {
                this.secureStorage.setItem(this.storageKey, games);
            })
        );
    }

    addGame(game: Partial<Game>): Observable<GameResponse> {
        return this.http.post<GameResponse>(this.apiUrl, game);
    }
}
