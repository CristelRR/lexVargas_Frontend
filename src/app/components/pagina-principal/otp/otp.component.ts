import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class OtpComponent implements OnInit {

  @Output() otpVerified = new EventEmitter<boolean>();  // Emite un booleano cuando el OTP es verificado

  twoFactorForm: FormGroup;
  otpVerificationError: string = '';

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService
  ) {
    this.twoFactorForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });
  }

  ngOnInit() {
  }

  verifyOTP() {
    const otp = this.twoFactorForm.value.otp;
    const email = 'usuario@ejemplo.com';  // Aquí puedes obtener el email de algún lugar, dependiendo de tu lógica

    // Llamamos al servicio para verificar el OTP
    this.usuarioService.verifyOTP(email, otp).subscribe(
      (response: any) => {
        this.otpVerified.emit(true);  // Emitir 'true' cuando el OTP es correcto
      },
      (error) => {
        this.otpVerificationError = 'Código inválido o expirado. Intenta nuevamente.';
        this.twoFactorForm.reset();
      }
    );
  }
}
