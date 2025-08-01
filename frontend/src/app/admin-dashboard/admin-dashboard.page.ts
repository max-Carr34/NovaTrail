import { Component, inject } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { HasRoleDirective } from 'src/app/directives/has-role.directive';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';

addIcons(allIcons);

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterModule,
    HasRoleDirective
  ]
})
export class AdminDashboardPage {
  private authService = inject(AuthService);

  constructor(private navCtrl: NavController) {}

  logoutAndGoHome() {
    this.authService.logout();
  }
}
