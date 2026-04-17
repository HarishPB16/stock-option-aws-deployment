import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAdminSource = new BehaviorSubject<boolean>(this.checkInitialAuth());
  isAdmin$ = this.isAdminSource.asObservable();

  constructor() {}

  private checkInitialAuth(): boolean {
    return sessionStorage.getItem('adminAuth') === 'true';
  }

  setAdminAuth(status: boolean) {
    if (status) {
      sessionStorage.setItem('adminAuth', 'true');
    } else {
      sessionStorage.removeItem('adminAuth');
    }
    this.isAdminSource.next(status);
  }
  
  get isAdmin(): boolean {
    return this.isAdminSource.value;
  }
}
