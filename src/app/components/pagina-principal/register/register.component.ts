import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ClienteService } from '../../../services/cliente.service';
import { Cliente } from '../../../models/cliente';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavBarraComponent } from '../nav-barra/nav-barra.component';
import { RecaptchaModule } from 'ng-recaptcha';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NavBarraComponent,
    RecaptchaModule,
    RouterLink
  ]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  captchaResolved: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Variables para fuerza de contraseña
  hasMinLength = false;
  hasUpperCase = false;
  hasLowerCase = false;
  hasNumber = false;
  showPasswordRequirements = false;

  @ViewChild('successModal') successModal: any;
  @ViewChild('errorModal') errorModal: any;

  campos = [
    { id: 'nombreCliente', label: 'Nombre', tipo: 'text' },
    { id: 'aPCliente', label: 'Apellido Paterno', tipo: 'text' },
    { id: 'aMCliente', label: 'Apellido Materno', tipo: 'text' },
    { id: 'direccion', label: 'Dirección', tipo: 'text' },
    { id: 'correo', label: 'Correo Electrónico', tipo: 'email' },
    { id: 'telefono', label: 'Teléfono', tipo: 'text' }
  ];

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private router: Router,
    private modalService: NgbModal
  ) {
    this.registerForm = this.fb.group({
      nombreCliente: ['', Validators.required],
      aPCliente: ['', Validators.required],
      aMCliente: ['', Validators.required],
      direccion: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, this.phoneValidator]],
      pass: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
      confirmPassword: ['', Validators.required],
      recaptcha: ['', Validators.required],
      aceptaPrivacidad: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  // ✔️ Visibilidad y fuerza de contraseña
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onPasswordBlur(): void {
    if (!this.registerForm.get('pass')?.value) {
      this.showPasswordRequirements = false;
    }
  }

  checkPasswordStrength(): void {
    const password = this.registerForm.get('pass')?.value || '';
    this.hasMinLength = password.length >= 8;
    this.hasUpperCase = /[A-Z]/.test(password);
    this.hasLowerCase = /[a-z]/.test(password);
    this.hasNumber = /\d/.test(password);
  }

  get passwordErrors(): ValidationErrors | null {
    return this.registerForm.get('pass')?.errors || null;
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    return pattern.test(value) ? null : { passwordStrength: true };
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('pass')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  phoneValidator(control: AbstractControl): ValidationErrors | null {
    const phone = control.value;
    return /^[0-9]{10}$/.test(phone) ? null : { invalidPhone: true };
  }

  resolved(captchaResponse: string | null): void {
    this.captchaResolved = !!captchaResponse;
    this.registerForm.patchValue({ recaptcha: captchaResponse || '' });
  }

  openModal(content: any) {
    this.modalService.open(content);
  }

  register(): void {
    if (this.registerForm.valid && this.captchaResolved) {
      const form = this.registerForm.value;
      const nuevoCliente: Cliente = {
        idCliente: 0,
        nombreCliente: form.nombreCliente,
        aPCliente: form.aPCliente,
        aMCliente: form.aMCliente,
        direccion: form.direccion,
        correo: form.correo,
        telefono: form.telefono,
        pass: form.pass,
        idRolFK: 3
      };

      this.clienteService.crearCliente(nuevoCliente).subscribe(
        () => {
          this.successMessage = 'Cliente registrado con éxito';
          this.openModal(this.successModal);
          setTimeout(() => this.router.navigate(['/login']), 3000);
        },
        (error) => {
          this.errorMessage = error.status === 400 && error.error.message === 'Este correo ya está registrado.'
            ? 'Este correo ya está registrado. Por favor, utiliza otro correo.'
            : 'Hubo un error al registrar el cliente. Intenta nuevamente.';
          this.openModal(this.errorModal);
        }
      );
    }
  }
}
