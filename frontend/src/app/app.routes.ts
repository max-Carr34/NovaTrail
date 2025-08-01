import { Routes } from '@angular/router';
import { RoleGuard } from './guards/role-guard.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.page').then( m => m.RegistroPage)
  },
  {
    path: 'parent-panel',
    loadComponent: () => import('./parent-panel/parent-panel.page').then( m => m.ParentPanelPage)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./reset-password/reset-password.page').then( m => m.ResetPasswordPage)
  },
  {
    path: 'child-registration',
    loadComponent: () => import('./child-registration/child-registration.page').then( m => m.ChildRegistrationPage)
  },
  {
  path: 'child-registration/:id',  // ✅ Ruta para editar
  loadComponent: () => import('./child-registration/child-registration.page').then(m => m.ChildRegistrationPage)
  },
  {
    path: 'child-list',
    loadComponent: () => import('./child-list/child-list.page').then( m => m.ChildListPage),
    canActivate: [RoleGuard]
  },
  {
    path: 'admin-dashboard',
    loadComponent: () => import('./admin-dashboard/admin-dashboard.page').then( m => m.AdminDashboardPage),
    canActivate: [RoleGuard]
  },
  {
    path: 'child-profile',
    loadComponent: () => import('./child-profile/child-profile.page').then( m => m.ChildProfilePage)
  },
  {
    path: 'parent-management',
    loadComponent: () => import('./parent-management/parent-management.page').then( m => m.ParentManagementPage),
    canActivate: [RoleGuard]
  },
  {
    path: 'change-password',
    loadComponent: () => import('./change-password/change-password.page').then( m => m.ChangePasswordPage)
  },
  {
    path: 'medical-info/:id',
    loadComponent: () => import('./medical-info/medical-info.page').then( m => m.MedicalInfoPage),
  },
  {
    path: 'medical-form/:id',
    loadComponent: () => import('./medical-form/medical-form.page').then( m => m.MedicalFormPage)
  },
  {
    path: 'medical-records',
    loadComponent: () => import('./medical-records/medical-records.page').then( m => m.MedicalRecordsPage),
    canActivate: [RoleGuard]
  },
  {
    path: 'notifications',
    loadComponent: () => import('./notifications/notifications.page').then( m => m.NotificationsPage)
  },
  {
    path: 'child-timeline/:id',
    loadComponent: () => import('./child-timeline/child-timeline.page').then( m => m.ChildTimelinePage)
  },
  {
    path: 'add-timeline-event',
    loadComponent: () => import('./add-timeline-event/add-timeline-event.page').then( m => m.AddTimelineEventPage),
    canActivate: [RoleGuard]
  },
  {
    path: 'add-timeline-form/:id',
    loadComponent: () => import('./add-timeline-form/add-timeline-form.page').then( m => m.AddTimelineFormPage),
    canActivate: [RoleGuard]
  },
  {
    path: 'communication-panel',
    loadComponent: () => import('./communication-panel/communication-panel.page').then( m => m.CommunicationPanelPage),
    canActivate: [RoleGuard]
  },
  {
    path: 'communication-detail/:id',
    loadComponent: () => import('./communication-detail/communication-detail.page').then( m => m.CommunicationDetailPage)
  },
  {
    path: 'communication-select',
    loadComponent: () => import('./communication-select/communication-select.page').then( m => m.CommunicationSelectPage)
  },
];
