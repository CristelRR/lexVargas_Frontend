import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Empleado } from '../../../models/empleados';
import { EmpleadoService } from '../../../services/empleado.service';
import { EspecialidadService } from '../../../services/especialidad.service';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-editar-empleado',
  templateUrl: './editar-empleado.component.html',
  styleUrls: ['./editar-empleado.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class EditarEmpleadoComponent implements OnInit {
  @Input() empleado: Empleado = {
    fechaIngreso: '',
    correo: '',
    nombreEmpleado: '',
    aPEmpleado: '',
    aMEmpleado: '',
    telefono: '',
    pass: '',
    idRolFK: 0,
    idEspecialidadFK: 0
  };

  @Output() empleadoActualizado = new EventEmitter<void>();
  @Output() cerrarModal = new EventEmitter<void>();

  @ViewChild('successModal') successModal: any;
  @ViewChild('errorModal') errorModal: any;

  especialidades: any[] = [];

  constructor(
    private empleadoService: EmpleadoService,
    private especialidadService: EspecialidadService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.cargarEspecialidades();
  }

  cargarEspecialidades(): void {
    this.especialidadService.getEspecialidades().subscribe(
      res => {
        this.especialidades = res;
      },
      err => console.error('Error al cargar especialidades:', err)
    );
  }

  actualizarEmpleado(form: NgForm): void {
    if (form.valid) {
      this.empleadoService.actualizarEmpleado(this.empleado).subscribe(
        res => {
          this.empleadoActualizado.emit();
          this.cerrarModal.emit();
  
          // Mostrar modal de éxito en el padre si está definido
          const parent = window as any;
          if (parent.successModalGlobal) {
            this.modalService.open(parent.successModalGlobal);
            setTimeout(() => this.modalService.dismissAll(), 3000);
          }
        },
        err => {
          console.error('Error al actualizar empleado:', err);
  
          const parent = window as any;
          if (parent.errorModalGlobal) {
            this.modalService.open(parent.errorModalGlobal);
            setTimeout(() => this.modalService.dismissAll(), 3000);
          }
        }
      );
    } else {
    }
  }  

  cancelarEdicion(): void {
    this.cerrarModal.emit();
  }
}
