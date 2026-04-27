import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAdminSource: BehaviorSubject<boolean>;
  isAdmin$;
  private authTimeout: any;

  constructor(private router: Router) {
    this.isAdminSource = new BehaviorSubject<boolean>(this.checkInitialAuth());
    this.isAdmin$ = this.isAdminSource.asObservable();
  }

  private checkInitialAuth(): boolean {
    const isAuth = sessionStorage.getItem('adminAuth') === 'true';
    const authTimeStr = sessionStorage.getItem('adminAuthTime');
    
    if (isAuth && authTimeStr) {
       const authTime = parseInt(authTimeStr, 10);
       const now = Date.now();
       const twoHours = 2 * 60 * 60 * 1000;
       
       if (now - authTime > twoHours) {
          // expired
          sessionStorage.removeItem('adminAuth');
          sessionStorage.removeItem('adminAuthTime');
          return false;
       } else {
          // valid, set a timeout to clear it
          this.setLogoutTimer(twoHours - (now - authTime));
          return true;
       }
    }
    return false;
  }

  setAdminAuth(status: boolean) {
    if (status) {
      sessionStorage.setItem('adminAuth', 'true');
      sessionStorage.setItem('adminAuthTime', Date.now().toString());
      this.setLogoutTimer(2 * 60 * 60 * 1000);
    } else {
      sessionStorage.removeItem('adminAuth');
      sessionStorage.removeItem('adminAuthTime');
      this.clearLogoutTimer();
    }
    this.isAdminSource.next(status);
  }

  logout() {
    this.setAdminAuth(false);
    this.router.navigate(['/home']);
  }

  private setLogoutTimer(duration: number) {
     this.clearLogoutTimer();
     this.authTimeout = setTimeout(() => {
        this.logout();
     }, duration);
  }

  private clearLogoutTimer() {
     if (this.authTimeout) {
         clearTimeout(this.authTimeout);
         this.authTimeout = null;
     }
  }
  
  get isAdmin(): boolean {
    return this.isAdminSource.value;
  }
}
