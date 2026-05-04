import { Component } from '@angular/core';

@Component({
  selector: 'app-mbd-project',
  templateUrl: './mbd-project.component.html',
  styleUrls: ['./mbd-project.component.css']
})
export class MbdProjectComponent {
  activeTab: string = 'project';

  setTab(tab: string) {
    this.activeTab = tab;
  }
}
