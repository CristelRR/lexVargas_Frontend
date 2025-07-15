import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Empleado } from '../../../models/empleados';
import { EmpleadoService } from '../../../services/empleado.service';
import { RolService } from '../../../services/rol.service';
import { EspecialidadService } from '../../../services/especialidad.service';
import { BarraLateralComponent } from '../../barra-lateral/barra-lateral.component';
import { NuevoEmpleadoComponent } from '../../modals/nuevo-empleado/nuevo-empleado.component';
import { EditarEmpleadoComponent } from '../../modals/editar-empleado/editar-empleado.component';
import { BreadcrumbsComponent } from '../../breadcrumbs/breadcrumbs.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-crud-empleado',
  standalone: true,
  imports: [
    BarraLateralComponent,
    CommonModule,
    FormsModule,
    NuevoEmpleadoComponent,
    EditarEmpleadoComponent,
    BreadcrumbsComponent
  ],
  templateUrl: './crud-empleado.component.html',
  styleUrls: ['./crud-empleado.component.css']
})
export class CrudEmpleadoComponent implements OnInit {
  empleados: Empleado[] = [];
  empleadosFiltrados: Empleado[] = [];
  empleadosPaginados: Empleado[] = [];

  modalEditarVisible: boolean = false;
  modalNuevoVisible: boolean = false;
  empleadoSeleccionado: Empleado | null = null;

  // Filtros
  filtroNombre: string = '';
  filtroCorreo: string = '';
  filtroTelefono: string = '';
  filtroRol: string = '';
  filtroEspecialidad: string = '';

  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 6;

  // Modales
  @ViewChild('successModal') successModal: any;
  @ViewChild('errorModal') errorModal: any;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    public empleadoService: EmpleadoService,
    public rolService: RolService,
    public especialidadService: EspecialidadService,
    private modalService: NgbModal,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.getEmpleados();
    this.getRoles();
    this.getEspecialidades();
  }

  getEmpleados() {
    this.empleadoService.getEmpleados().subscribe(
      res => {
        this.empleados = res;
        
        // Ordenar los empleados por fecha de ingreso de más reciente a más antigua
        this.empleados.sort((a, b) => {
          const fechaA = new Date(a.fechaIngreso);
          const fechaB = new Date(b.fechaIngreso);
          return fechaB.getTime() - fechaA.getTime(); // Orden descendente
        });

        this.filtrarEmpleados();
      },
      err => console.error(err)
    );
  }

  getRoles() {
    this.rolService.getRoles().subscribe(
      res => this.rolService.roles = res,
      err => console.error(err)
    );
  }

  getEspecialidades() {
    this.especialidadService.getEspecialidades().subscribe(
      res => this.especialidadService.especialidades = res,
      err => console.error(err)
    );
  }

  filtrarEmpleados() {
    this.empleadosFiltrados = this.empleados.filter(empleado => {
      const coincideNombre = !this.filtroNombre || (`${empleado.nombreEmpleado} ${empleado.aPEmpleado} ${empleado.aMEmpleado}`.toLowerCase().includes(this.filtroNombre.toLowerCase()));
      const coincideCorreo = !this.filtroCorreo || empleado.correo.toLowerCase().includes(this.filtroCorreo.toLowerCase());
      const coincideTelefono = !this.filtroTelefono || empleado.telefono.toLowerCase().includes(this.filtroTelefono.toLowerCase());
      const coincideRol = !this.filtroRol || empleado.idRolFK?.toString() === this.filtroRol;
      const coincideEspecialidad = !this.filtroEspecialidad || empleado.idEspecialidadFK?.toString() === this.filtroEspecialidad;
      return coincideNombre && coincideCorreo && coincideTelefono && coincideRol && coincideEspecialidad;
    });

    this.cambiarPagina(1);
  }

  get totalPaginas(): number {
    return Math.ceil(this.empleadosFiltrados.length / this.itemsPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    const inicio = (pagina - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.empleadosPaginados = this.empleadosFiltrados.slice(inicio, fin);

    if (isPlatformBrowser(this.platformId)) {
      const topElement = document.querySelector('.titulo-empleados');
      topElement?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  abrirModalNuevoEmpleado() {
    this.modalNuevoVisible = true;
  }

  cerrarModalNuevoEmpleado() {
    this.modalNuevoVisible = false;
  }

  abrirModalEditar(empleado: Empleado) {
    this.empleadoSeleccionado = empleado;
    this.modalEditarVisible = true;
  }

  cerrarModalEditar() {
    this.modalEditarVisible = false;
    this.empleadoSeleccionado = null;
  }

  crearEmpleado(nuevoEmpleado: Empleado) {
    this.empleadoService.crearEmpleado(nuevoEmpleado).subscribe(
      res => {
        this.getEmpleados();
        this.cerrarModalNuevoEmpleado();

        this.successMessage = 'Empleado registrado con éxito.';
        this.modalService.open(this.successModal);
        setTimeout(() => this.modalService.dismissAll(), 3000);
      },
      err => {


        if (
          err.status === 500 &&
          err.error.message?.toLowerCase().includes('duplicate')
        ) {
          this.errorMessage = 'El correo ya está registrado. Usa otro diferente.';
        } else {
          this.errorMessage = 'Hubo un error al registrar el empleado.';
        }

        this.modalService.open(this.errorModal);
        setTimeout(() => this.modalService.dismissAll(), 3000);
      }
    );
  }

  onEmpleadoActualizado() {
    this.getEmpleados();
    this.cerrarModalEditar();
  }

  getRolNombre(idRol: number): string {
    const rol = this.rolService.roles.find(r => r.idRol === idRol);
    return rol ? rol.nombreRol : 'Sin Rol';
  }

  getEspecialidadNombre(idEspecialidad: number): string {
    const especialidad = this.especialidadService.especialidades.find(e => e.idEspecialidad === idEspecialidad);
    return especialidad ? especialidad.nombreEspecialidad : 'Sin Especialidad';
  }
}
