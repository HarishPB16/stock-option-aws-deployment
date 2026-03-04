import { Component, OnInit } from '@angular/core';
import { OptionsService } from '../../core/services/options.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
    selectedDate: string = '';
    isLoading = false;
    historyData: any = null;
    errorMessage: string | null = null;

    constructor(private optionsService: OptionsService) {
        // default to today
        this.selectedDate = new Date().toISOString().split('T')[0];
    }

    ngOnInit(): void {
        this.fetchHistory();
    }

    fetchHistory() {
        if (!this.selectedDate) return;

        this.isLoading = true;
        this.errorMessage = null;
        this.historyData = null;

        this.optionsService.getHistoryByDate(this.selectedDate)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
                next: (res) => {
                    if (res.success && res.data) {
                        this.historyData = res.data;
                    } else {
                        this.errorMessage = 'Failed to parse history data.';
                    }
                },
                error: (err) => {
                    this.errorMessage = err?.error?.error?.message || 'Error communicating with server.';
                }
            });
    }

    isDeleting: { [ticker: string]: boolean } = {};

    deleteOption(ticker: string) {
        if (!ticker) return;

        this.isDeleting[ticker] = true;
        this.optionsService.deleteOption(ticker)
            .pipe(finalize(() => this.isDeleting[ticker] = false))
            .subscribe({
                next: () => {
                    // Refetch the data for the selected date after successful deletion
                    this.fetchHistory();
                },
                error: (err) => {
                    this.errorMessage = err.message || 'Failed to delete records.';
                }
            });
    }
}
