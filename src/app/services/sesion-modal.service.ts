import { Injectable, Injector } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ExpiracionSesionComponent } from '../components/pagina-principal/expiracion-sesion/expiracion-sesion.component';
import { SesionService } from './sesion.service';

@Injectable({
  providedIn: 'root',
})
export class SesionModalService {
  private modalRef: MatDialogRef<any> | null = null;

  constructor(
    private _dialog: MatDialog,
    private injector: Injector  
  ) {}

  openExpiracionSesionModal() {
    this.modalRef = this._dialog.open(ExpiracionSesionComponent, {
      width: '400px',
      disableClose: true,
    });

    this.modalRef.afterClosed().subscribe(() => {
      const sesionService = this.injector.get(SesionService);
      sesionService.reiniciarModal(); 
      this.modalRef = null;
    });
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
    } else {
      this._dialog.closeAll();
    }
  }
}
