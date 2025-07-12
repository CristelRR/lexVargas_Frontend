import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { SesionModalService } from './sesion-modal.service';

@Injectable({
  providedIn: 'root',
})
export class SesionService {
  private timeout: any;
  private extensionTimeout: any;
  private actividadTimeout: any;

  private modalOpen = false;
  private sessionExtended = false;
  private verificacionActiva = false;

  private readonly TIEMPO_MOSTRAR_MODAL = 5 * 60 * 1000; // 5 minutos
  private readonly TIEMPO_CERRAR_SESION = 7 * 60 * 1000; // 7 minutos
  private readonly TIEMPO_INACTIVIDAD = 3 * 60 * 1000;   // 3 minutos

  constructor(
    private router: Router,
    private http: HttpClient,
    private sesionModalService: SesionModalService,
    private localStorageService: LocalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('storage', (event) => this.verificarCambiosEnStorage(event));
    }
  }

  iniciarVerificacion(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.verificacionActiva) {
        return resolve(true);
      }

      this.verificacionActiva = true;
      this.limpiarTemporizadores();

      const rawExp = this.localStorageService.getItem('exp');
      const exp = rawExp ? parseInt(rawExp, 10) : 0;
      const expMilis = exp < 9999999999 ? exp * 1000 : exp;

      if (Date.now() > expMilis) {
        this.pedirExtension();
        this.verificacionActiva = false;
        return resolve(false);
      }

      this.iniciarDeteccionInactividad();

      this.timeout = setTimeout(() => {
        this.pedirExtension();
      }, this.TIEMPO_MOSTRAR_MODAL);

      this.extensionTimeout = setTimeout(() => {
        if (!this.sessionExtended) {
          this.cerrarSesion();
        }
      }, this.TIEMPO_CERRAR_SESION);

      resolve(true);
    });
  }

  pedirExtension() {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!this.localStorageService.getItem('token')) {
      console.warn('⛔ No hay sesión activa. No se muestra el modal.');
      return;
    }

    if (!this.modalOpen) {
      this.modalOpen = true;
      try {
        this.sesionModalService.openExpiracionSesionModal();
      } catch (error) {
        console.warn('⚠️ No se pudo abrir el modal:', error);
      }
    }
  }

  extenderSesion() {
    const token = this.localStorageService.getItem('token');

    if (token) {
      //this.http.post<any>('https://mj5qrp25-3000.usw3.devtunnels.ms/usuarios/extender-sesion', {}, {
      this.http.post<any>('http://localhost:3000/usuarios/extender-sesion', {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (response) => {
          this.localStorageService.setItem('token', response.token);

          const tokenPayload = JSON.parse(atob(response.token.split('.')[1]));
          const newExp = tokenPayload.exp * 1000;
          this.localStorageService.setItem('exp', newExp.toString());

          this.sessionExtended = true;
          this.modalOpen = false;
          this.verificacionActiva = false;

          this.limpiarTemporizadores();
          this.iniciarVerificacion();
        },
        error: (err) => {
          console.error('❌ Error al extender sesión:', err);
        }
      });
    }
  }

  cerrarSesion() {
    this.localStorageService.clear();
    this.localStorageService.setItem('logoutReason', 'expirada'); // 👈 nuevo

    this.sesionModalService.closeModal();
    this.verificacionActiva = false;
    this.modalOpen = false;
    this.sessionExtended = false;

    this.limpiarTemporizadores();
    this.router.navigate(['/login']);
  }

  redirectToLogin() {
    this.router.navigate(['/login']);
  }

  isTokenExpired(): boolean {
    const rawExp = this.localStorageService.getItem('exp');
    const exp = rawExp ? parseInt(rawExp, 10) : 0;
    const expMilis = exp < 9999999999 ? exp * 1000 : exp;
    return Date.now() > expMilis;
  }

  reiniciarModal() {
    this.modalOpen = false;
  }

  private iniciarDeteccionInactividad() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.resetearTemporizadorInactividad();

    const eventos = ['mousemove', 'keydown', 'click', 'touchstart'];
    eventos.forEach(evento => {
      window.addEventListener(evento, () => this.resetearTemporizadorInactividad());
    });
  }

  private resetearTemporizadorInactividad() {
    clearTimeout(this.actividadTimeout);
  
    this.actividadTimeout = setTimeout(() => {
      console.warn('⚠️ Usuario inactivo. Mostrando modal...');
      this.pedirExtension();
  
      // ⏳ Da otros 2 minutos para responder o cerrar sesión
      this.extensionTimeout = setTimeout(() => {
        if (!this.sessionExtended) {
          console.warn('⛔ No se respondió al modal tras inactividad. Cerrando sesión...');
          this.cerrarSesion();
        }
      }, 1 * 60 * 1000); // 2 minutos más
    }, this.TIEMPO_INACTIVIDAD);
  }
  
  public limpiarTemporizadores() {
    clearTimeout(this.timeout);
    clearTimeout(this.extensionTimeout);
    clearTimeout(this.actividadTimeout);
  }

  private verificarCambiosEnStorage(event: StorageEvent) {
    if (!isPlatformBrowser(this.platformId)) return;

    if (event.key === 'exp') {
      const nuevaExp = event.newValue ? parseInt(event.newValue, 10) : 0;
      const expMilis = nuevaExp < 9999999999 ? nuevaExp * 1000 : nuevaExp;

      if (Date.now() > expMilis) {
        console.warn('🔄 Token expirado detectado en otra pestaña. Cerrando sesión...');
        this.cerrarSesion();
      } else {
        console.info('🔁 Token actualizado desde otra pestaña. Reiniciando verificación...');
        this.verificacionActiva = false;
        this.iniciarVerificacion();
      }
    }

    if (event.key === 'token' && !event.newValue) {
      console.warn('❌ Token eliminado desde otra pestaña. Cerrando sesión...');
      this.cerrarSesion();
    }
  }
}
