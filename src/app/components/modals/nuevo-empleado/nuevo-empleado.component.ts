import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';
import { EspecialidadService } from '../../../services/especialidad.service';
import { RolService } from '../../../services/rol.service';
import { Empleado } from '../../../models/empleados';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-nuevo-empleado',
  templateUrl: './nuevo-empleado.component.html',
  styleUrls: ['./nuevo-empleado.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
})
export class NuevoEmpleadoComponent implements OnInit {
  @Output() crear = new EventEmitter<Empleado>();
  @Output() cerrarModal = new EventEmitter<void>();

  @ViewChild('errorModal') errorModal: any;
  errorMessage: string = '';

  agregarEmpleadoForm: FormGroup;
  especialidades: any[] = [];
  roles: any[] = [];
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    public especialidadService: EspecialidadService,
    public rolService: RolService,
    private modalService: NgbModal
  ) {
    this.agregarEmpleadoForm = new FormGroup(
      {
        nombreEmpleado: new FormControl('', Validators.required),
        aPEmpleado: new FormControl('', Validators.required),
        aMEmpleado: new FormControl(''),
        fechaIngreso: new FormControl('', Validators.required),
        correo: new FormControl('', [Validators.required, Validators.email]),
        telefono: new FormControl('', [
          Validators.required,
          Validators.pattern('^[0-9]{10}$'),
        ]),
        pass: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
          this.passwordStrengthValidator,
        ]),
        confirmPassword: new FormControl('', Validators.required),
        idRolFK: new FormControl('', Validators.required),
        idEspecialidadFK: new FormControl('', Validators.required),
      },
      this.passwordMatchValidator
    );
  }

  ngOnInit(): void {
    this.cargarEspecialidades();
    this.cargarRoles();
  }

  cargarEspecialidades() {
    this.especialidadService.getEspecialidades().subscribe(
      res => (this.especialidades = res),
    );
  }

  cargarRoles() {
    this.rolService.getRoles().subscribe(
      res => (this.roles = res),
    );
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    return regex.test(password) ? null : { passwordStrength: true };
  }

  passwordMatchValidator(formGroup: AbstractControl): ValidationErrors | null {
    const password = formGroup.get('pass')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.agregarEmpleadoForm.valid) {
      const nuevoEmpleado = this.agregarEmpleadoForm.value;
      this.crear.emit(nuevoEmpleado);
      this.agregarEmpleadoForm.reset();
    } else {
      this.errorMessage = 'Por favor completa correctamente el formulario.';
      this.modalService.open(this.errorModal);
      setTimeout(() => this.modalService.dismissAll(), 3000);
    }
  }
}
