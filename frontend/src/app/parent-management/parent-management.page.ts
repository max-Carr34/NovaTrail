import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, LoadingController, NavController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ParentService } from 'src/app/services/parent.service';
import { ChildService } from 'src/app/services/child.service';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';

addIcons(allIcons);

@Component({
  selector: 'app-parent-management',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './parent-management.page.html',
  styleUrls: ['./parent-management.page.scss']
})
export class ParentManagementPage {
  private parentService = inject(ParentService);
  private childService = inject(ChildService);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);
  private navCtrl = inject(NavController);

  parents: any[] = [];
  childrenCountMap: { [key: number]: number } = {};
  totalChildrenCount = 0;

  async ionViewWillEnter() {
    const loading = await this.loadingCtrl.create({ message: 'Cargando usuarios...' });
    await loading.present();

    this.parentService.getAllParents().subscribe({
      next: async (data) => {
        this.parents = data;
        this.totalChildrenCount = 0;

        // Cargar hijos para cada padre en paralelo
        await Promise.all(this.parents.map(parent => this.loadChildrenCount(parent.id)));

        await loading.dismiss();
      },
      error: async () => {
        await loading.dismiss();
        this.showError('No se pudieron cargar los usuarios.');
      }
    });
  }

  goBack(): void {
    this.navCtrl.back();
  }

  loadChildrenCount(parentId: number): Promise<void> {
    return new Promise((resolve) => {
      this.childService.getChildrenByParentId(parentId).subscribe({
        next: (children) => {
          this.childrenCountMap[parentId] = children.length;
          this.totalChildrenCount += children.length;
          resolve();
        },
        error: () => {
          this.childrenCountMap[parentId] = 0;
          resolve();
        }
      });
    });
  }

  private async showError(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
