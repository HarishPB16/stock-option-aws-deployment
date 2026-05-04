import { Component } from '@angular/core';

@Component({
  selector: 'app-angular-study',
  standalone: true,
  imports: [],
  templateUrl: './angular-study.component.html',
  styleUrl: './angular-study.component.css'
})
export class AngularStudyComponent {
  activeTab: string = 'angular';

  setTab(tab: string) {
    this.activeTab = tab;
  }
}
