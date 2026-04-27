import { Component, OnInit } from '@angular/core';

interface ExpiryData {
  name: string;
  type: string;
  day: string;
  date: string;
}

interface HolidayData {
  no: number;
  holiday: string;
  date: string;
  day: string;
}

@Component({
  selector: 'app-market-calendar',
  templateUrl: './market-calendar.component.html',
  styleUrls: ['./market-calendar.component.css']
})
export class MarketCalendarComponent implements OnInit {

  expiries: ExpiryData[] = [
    { name: 'NIFTY', type: 'Monthly', day: 'Tuesday', date: '28-Apr-2026' },
    { name: 'BANK NIFTY', type: 'Monthly', day: 'Tuesday', date: '28-Apr-2026' },
    { name: 'SENSEX', type: 'Monthly', day: 'Thursday', date: '30-Apr-2026' },
    { name: 'FINNIFTY', type: 'Monthly', day: 'Tuesday', date: '28-Apr-2026' },
    { name: 'MIDCPNIFTY', type: 'Monthly', day: 'Tuesday', date: '28-Apr-2026' },
    { name: 'Stock Expiry', type: 'Monthly', day: 'Tuesday', date: '28-Apr-2026' }
  ];

  holidays: HolidayData[] = [
    { no: 1, holiday: 'Maharashtra Day', date: '01-May-2026', day: 'Friday' },
    { no: 2, holiday: 'Bakri Id (Id-Uz-Zuha)', date: '28-May-2026', day: 'Thursday' },
    { no: 3, holiday: 'Muharram', date: '26-Jun-2026', day: 'Friday' },
    { no: 4, holiday: 'Ganesh Chaturthi', date: '14-Sep-2026', day: 'Monday' },
    { no: 5, holiday: 'Mahatma Gandhi Jayanti', date: '02-Oct-2026', day: 'Friday' },
    { no: 6, holiday: 'Dussehra', date: '20-Oct-2026', day: 'Tuesday' },
    { no: 7, holiday: 'Diwali-Balipratipada', date: '10-Nov-2026', day: 'Tuesday' },
    { no: 8, holiday: 'Gurunanak Jayanti', date: '24-Nov-2026', day: 'Tuesday' },
    { no: 9, holiday: 'Christmas', date: '25-Dec-2026', day: 'Friday' }
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
