import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sub-menu',
  templateUrl: './sub-menu.component.html',
  styleUrls: ['./sub-menu.component.css']
})
export class SubMenuComponent {
  @Input() activeTab: 'prompt' | 'study' | 'iq' | 'youtube' | 'category' = 'prompt';
  @Output() tabChange = new EventEmitter<'prompt' | 'study' | 'iq' | 'youtube' | 'category'>();

  onTabClick(tab: 'prompt' | 'study' | 'iq' | 'youtube' | 'category'): void {
    this.tabChange.emit(tab);
  }
}
