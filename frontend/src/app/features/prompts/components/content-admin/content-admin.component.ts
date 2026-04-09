import { Component } from '@angular/core';

@Component({
  selector: 'app-content-admin',
  templateUrl: './content-admin.component.html',
  styleUrls: ['./content-admin.component.css']
})
export class ContentAdminComponent {
  activeContentTab: 'vids' | 'games' = 'vids';

  onTabClick(tab: 'vids' | 'games'): void {
    this.activeContentTab = tab;
  }
}
