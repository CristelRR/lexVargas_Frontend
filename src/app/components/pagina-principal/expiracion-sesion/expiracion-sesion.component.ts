import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';  // Para cerrar el modal
import { SesionService } from '../../../services/sesion.service';

@Component({
  selector: 'app-expiracion-sesion',
  templateUrl: './expiracion-sesion.component.html',
  styleUrls: ['./expiracion-sesion.component.css'],
})
export class ExpiracionSesionComponent {

  constructor(
    private dialogRef: MatDialogRef<ExpiracionSesionComponent>,
    private sesionService: SesionService
  ) {}

  extenderSesion() {
    this.sesionService.extenderSesion();
    this.dialogRef.close();  // Cerrar el modal después de extender la sesión
  }

  cerrarSesion() {
    this.sesionService.cerrarSesion();
  }
}
