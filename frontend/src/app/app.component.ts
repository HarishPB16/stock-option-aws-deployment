import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isDarkTheme = true;

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      this.isDarkTheme = false;
      document.body.setAttribute('data-theme', 'light');
    } else {
      document.body.setAttribute('data-theme', 'dark');
    }
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    const newTheme = this.isDarkTheme ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }
}

