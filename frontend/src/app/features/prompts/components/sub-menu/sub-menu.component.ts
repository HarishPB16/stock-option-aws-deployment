import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sub-menu',
  templateUrl: './sub-menu.component.html',
  styleUrls: ['./sub-menu.component.css']
})
export class SubMenuComponent {
  @Input() activeTab: 'prompt' | 'study' | 'iq' | 'content' | 'category' | 'calculator' = 'prompt';
  @Output() tabChange = new EventEmitter<'prompt' | 'study' | 'iq' | 'content' | 'category' | 'calculator'>();

  onTabClick(tab: 'prompt' | 'study' | 'iq' | 'content' | 'category' | 'calculator'): void {
    this.tabChange.emit(tab);
  }
}
