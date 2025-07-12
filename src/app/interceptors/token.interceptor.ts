import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from '../services/local-storage.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const localStorageService = inject(LocalStorageService);  // Inyectamos el servicio LocalStorage

  // Solo ejecuta si estamos en el navegador
  if (typeof window === 'undefined') {
    return next(req);
  }

  const token = localStorageService.getItem('token');  // Usamos el servicio para obtener el token
  const exp = localStorageService.getItem('exp');  // Usamos el servicio para obtener la fecha de expiración

  // Si no hay token, no hacemos nada con la solicitud (esto incluye el login)
  if (!token) {
    return next(req);
  }

  // Verificar si existe un token y su expiración
  if (exp && Date.now() > parseInt(exp, 10)) {
    // Si la sesión ha expirado
    localStorageService.clear();  // Limpiar localStorage usando el servicio
    router.navigate(['/login']);  // Redirigir al login
    return next(req); // Continuamos sin la autorización
  }

  // Si el token está válido, agrega el Authorization header
  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(authReq);
};
