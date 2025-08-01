import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    const role = this.auth.getUserRole();
    
    if (role === 'admin' || role === 'staff') {
      return true;
    }

    // Si no es admin ni staff, redirigir
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
