import { Directive, Input, TemplateRef, ViewContainerRef, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[hasRole]'
})
export class HasRoleDirective implements OnDestroy {
  private roles: string[] = [];
  private sub!: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {
    // ✅ Suscripción a cambios de rol
    this.sub = this.authService.role$.subscribe(() => {
      this.updateView();
    });
  }

  @Input()
  set hasRole(roles: string[]) {
    this.roles = roles.map(r => r.trim().toLowerCase());
    this.updateView();
  }

  private updateView() {
    this.viewContainer.clear();
    if (this.authService.hasRole(this.roles)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
