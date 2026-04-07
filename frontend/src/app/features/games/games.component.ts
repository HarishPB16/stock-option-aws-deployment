import { Component, OnInit } from '@angular/core';
import { GameService, Game } from '../../core/services/game.service';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.css']
})
export class GamesComponent implements OnInit {
  games: Game[] = [];
  loading = true;
  error = '';

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.fetchGames(false); 
  }

  fetchGames(forceRefresh: boolean): void {
    this.loading = true;
    this.error = '';
    
    this.gameService.getGames(forceRefresh).subscribe({
      next: (data) => {
        this.games = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load games.';
        this.loading = false;
      }
    });
  }

  onRefreshClick(): void {
    this.fetchGames(true);
  }
}
