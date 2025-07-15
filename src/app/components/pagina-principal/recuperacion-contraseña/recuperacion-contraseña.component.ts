import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';  // Importar NgbModal para trabajar con modales

@Component({
  selector: 'app-recuperacion-contraseña',
  templateUrl: './recuperacion-contraseña.component.html',
  styleUrls: ['./recuperacion-contraseña.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class RecuperacionContraseñaComponent implements OnInit {
  recuperarForm: FormGroup;
  enviado: boolean = false; // Variable para manejar el mensaje de éxito
  @ViewChild('successModal') successModal: any;  // Referencia al modal de éxito
  @ViewChild('errorModal') errorModal: any;      // Referencia al modal de error

  constructor(private fb: FormBuilder, private usuarioService: UsuarioService, private modalService: NgbModal) {
    this.recuperarForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {}

  enviarCorreo() {
    if (this.recuperarForm.valid) {
      const email = this.recuperarForm.value.email;
      this.usuarioService.enviarCorreoRecuperacion(email).subscribe(
        () => {
          this.enviado = true;
          this.openModal(this.successModal);  // Abre el modal de éxito

          // Limpiar el formulario después de enviar el correo exitosamente
          this.recuperarForm.reset(); // Restablece el formulario
        },
        (error) => {
          this.openModal(this.errorModal);  // Abre el modal de error
        }
      );
    }
  }

  // Método para abrir el modal
  openModal(content: any) {
    this.modalService.open(content);  // Abre el modal de éxito o error
  }

  // Método para redirigir al login cuando el botón "Volver al login" es presionado
  volverLogin() {
    // Cierra los modales abiertos antes de redirigir
    this.modalService.dismissAll();
    window.location.href = '/login';  // Redirige al login

    // Limpiar el formulario al hacer "Volver al login"
    this.recuperarForm.reset();
    this.enviado = false;  // Restablecer el estado de la variable 'enviado'
  }
}
