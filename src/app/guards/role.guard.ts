import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const user = JSON.parse(localStorage.getItem('usuario') || '{}');
    const rolUsuario = user?.rol;
    const rolesPermitidos = route.data['roles'] as number[];

    if (rolesPermitidos.includes(rolUsuario)) {
      return true;
    } else {
      this.router.navigate(['/error/403']);
      return false;
    }
  }
}
    