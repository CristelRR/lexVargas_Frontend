import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BarraLateralComponent } from '../../barra-lateral/barra-lateral.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../../services/cita.service';
import { CitaDetallada } from '../../../models/cita-detallada';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DetalleCitaClienteComponent } from '../../modals/detalle-cita-cliente/detalle-cita-cliente.component';
import { ServicioService } from '../../../services/servicio.service';
import { EmpleadoService } from '../../../services/empleado.service';
import { ClienteService } from '../../../services/cliente.service';
import { BreadcrumbsComponent } from "../../breadcrumbs/breadcrumbs.component";

interface FechaCitaExtendida extends CitaDetallada {
  date: number;
  month: number;
  year: number;
  horaInicio: string;
  horaFinal: string;
  abogadoNombreCompleto: string;
  clienteNombreCompleto: string;
}

interface Appointment {
  idCita: number | undefined;
  date: number;
  month: number;
  year: number;
  description: string;
  estadoCita: string;
}

@Component({
  selector: 'app-calendario-citas-secretaria',
  templateUrl: './calendario-citas-secretaria.component.html',
  styleUrls: ['./calendario-citas-secretaria.component.css'],
  standalone: true,
  imports: [
    BarraLateralComponent,
    FormsModule,
    CommonModule,
    BreadcrumbsComponent
]
})
export class CalendarioCitasSecretariaComponent implements OnInit {
  diasDelMes: (number | null)[] = [];
  mesActual: number;
  anioActual: number;
  nombreMesActual: string;
  nombresDias: string[] = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  ];

  citas: FechaCitaExtendida[] = [];
  appointments: Appointment[] = [];
  servicios: { idServicio: number; nombreServicio: string }[] = [];
  filtroServicio: string | null = null;
  filtroEstado: string | null = null;
  filtroAbogado: string | null = null;
  filtroCliente: string | null = null;
  coincidenciasAbogados: string[] = [];
  coincidenciasClientes: string[] = [];
  buscandoAbogado: boolean = false; // Control para mostrar solo sugerencias de abogado
  buscandoCliente: boolean = false; // Control para mostrar solo sugerencias de cliente
  hoy: { dia: number, mes: number, anio: number };

  constructor(
    public citaService: CitaService,
    public modalService: NgbModal,
    public servicioService: ServicioService,
    public empleadoService: EmpleadoService,
    public clienteService: ClienteService,
    private changeDetector: ChangeDetectorRef
  ) {
    const fecha = new Date();
    this.mesActual = fecha.getMonth();
    this.anioActual = fecha.getFullYear();
    this.nombreMesActual = this.obtenerNombreMes();
    const fechaHoy = new Date();
    this.hoy = {
      dia: fechaHoy.getDate(),
      mes: fechaHoy.getMonth(),
      anio: fechaHoy.getFullYear(),
    };
  }

  ngOnInit(): void {
    this.getServicios();
    this.getAllCitas();
    this.generarDiasDelMes();
  }

  getServicios(): void {
    this.servicioService.getServicios().subscribe(
      (res) => {
        this.servicios = res;
      },
    );
  }

  getAllCitas(): void {
    this.citaService.getAllCitas().subscribe(
      (citas: CitaDetallada[]) => {
        this.citas = citas.map((cita) => {
          const parsedDate = cita.fechaCita ? new Date(cita.fechaCita) : null;

          // Concatenar nombres completos para el abogado y el cliente
          const abogadoNombreCompleto = `${cita.abogadoNombre} ${cita.abogadoApellidoPaterno} ${cita.abogadoApellidoMaterno}`.trim();
          const clienteNombreCompleto = `${cita.nombreCliente} ${cita.apellidoPaternoCliente} ${cita.apellidoMaternoCliente}`.trim();

          if (parsedDate && !isNaN(parsedDate.getTime())) {
            return {
              ...cita,
              date: parsedDate.getUTCDate(),
              month: parsedDate.getUTCMonth(),
              year: parsedDate.getUTCFullYear(),
              horaInicio: cita.horaInicio ? cita.horaInicio.substring(11, 16) : '',
              horaFinal: cita.horaFinal ? cita.horaFinal.substring(11, 16) : '',
              abogadoNombreCompleto,
              clienteNombreCompleto
            } as FechaCitaExtendida;
          } else {
            return {
              ...cita,
              date: 0,
              month: 0,
              year: 0,
              horaInicio: '',
              horaFinal: '',
              abogadoNombreCompleto,
              clienteNombreCompleto
            } as FechaCitaExtendida;
          }
        });
        this.filtrarCitas();
      },
    );
  }

  // Filtra citas y actualiza coincidencias
  filtrarCitas(): void {
    if (this.buscandoAbogado) {
      this.buscarCoincidenciasAbogados();
    }
    if (this.buscandoCliente) {
      this.buscarCoincidenciasClientes();
    }

    const servicioIdFiltro = this.filtroServicio || null;
    const estadoCitaFiltro = this.filtroEstado || null;
    const abogadoFiltro = this.filtroAbogado ? this.filtroAbogado.toLowerCase() : null;
    const clienteFiltro = this.filtroCliente ? this.filtroCliente.toLowerCase() : null;

    this.appointments = this.citas
      .filter((cita) => {
        const coincideServicio = !servicioIdFiltro || cita.idServicioFK?.toString() === servicioIdFiltro;
        const coincideEstado = !estadoCitaFiltro || cita.estadoCita === estadoCitaFiltro;
        const coincideAbogado = !abogadoFiltro || (cita.abogadoNombreCompleto.toLowerCase().includes(abogadoFiltro));
        const coincideCliente = !clienteFiltro || (cita.clienteNombreCompleto.toLowerCase().includes(clienteFiltro));

        return coincideServicio && coincideEstado && coincideAbogado && coincideCliente;
      })
      .map((cita) => ({
          idCita: cita.idCita,
          date: cita.date,
          month: cita.month,
          year: cita.year,
          description: `${cita.horaInicio} - ${cita.horaFinal}`,
          estadoCita: cita.estadoCita
      }));
  }

  // Coincidencias para nombres completos de abogados
  buscarCoincidenciasAbogados(): void {
    const abogadoFiltro = this.filtroAbogado ? this.filtroAbogado.toLowerCase() : '';
    if (abogadoFiltro) {
      this.coincidenciasAbogados = this.citas
        .map(cita => cita.abogadoNombreCompleto)
        .filter(nombreCompleto => nombreCompleto && nombreCompleto.toLowerCase().includes(abogadoFiltro));
      this.coincidenciasAbogados = Array.from(new Set(this.coincidenciasAbogados));
    } else {
      this.coincidenciasAbogados = [];
    }
  }

  // Coincidencias para nombres completos de clientes
  buscarCoincidenciasClientes(): void {
    const clienteFiltro = this.filtroCliente ? this.filtroCliente.toLowerCase() : '';
    if (clienteFiltro) {
      this.coincidenciasClientes = this.citas
        .map(cita => cita.clienteNombreCompleto)
        .filter(nombreCompleto => nombreCompleto && nombreCompleto.toLowerCase().includes(clienteFiltro));
      this.coincidenciasClientes = Array.from(new Set(this.coincidenciasClientes));
    } else {
      this.coincidenciasClientes = [];
    }
  }

  // Métodos para seleccionar un abogado y cliente
  seleccionarAbogado(abogado: string): void {
    this.filtroAbogado = abogado;
    this.coincidenciasAbogados = [];
    this.buscandoAbogado = false;
    this.changeDetector.detectChanges();
    this.filtrarCitas();
  }

  seleccionarCliente(cliente: string): void {
    this.filtroCliente = cliente;
    this.coincidenciasClientes = [];
    this.buscandoCliente = false;
    this.changeDetector.detectChanges();
    this.filtrarCitas();
  }

  // Métodos para activar la búsqueda de abogado y cliente
  iniciarBusquedaAbogado(): void {
    this.buscandoAbogado = true;
    this.buscandoCliente = false;
    this.filtrarCitas();
  }

  iniciarBusquedaCliente(): void {
    this.buscandoCliente = true;
    this.buscandoAbogado = false;
    this.filtrarCitas();
  }

  generarDiasDelMes(): void {
    const primerDia = new Date(this.anioActual, this.mesActual, 1).getDay();
    const diasEnElMes = new Date(this.anioActual, this.mesActual + 1, 0).getDate();
    const inicioCalendario = (primerDia === 0) ? 6 : primerDia - 1;

    this.diasDelMes = Array.from({ length: 42 }, (_, i) => {
      if (i < inicioCalendario || i >= inicioCalendario + diasEnElMes) {
        return null;
      }
      return i - inicioCalendario + 1;
    });
  }

  obtenerNombreMes(): string {
    return new Date(this.anioActual, this.mesActual).toLocaleString('es-ES', { month: 'long' });
  }

  cambiarMes(incremento: number): void {
    this.mesActual += incremento;
    if (this.mesActual < 0) {
      this.mesActual = 11;
      this.anioActual--;
    } else if (this.mesActual > 11) {
      this.mesActual = 0;
      this.anioActual++;
    }
    this.nombreMesActual = this.obtenerNombreMes();
    this.generarDiasDelMes();
  }

  tieneCitas(dia: number | null): Appointment[] {
    if (dia === null || dia === 0) return [];
    return this.appointments.filter(
      cita => cita.date === dia && cita.month === this.mesActual && cita.year === this.anioActual
    );
  }

  openCitaModal(cita: Appointment): void {
    const citaCompleta = this.citas.find(c => c.idCita === cita.idCita);
  
    if (citaCompleta) {
      const fechaFormateada = new Date(citaCompleta.fechaCita).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
      });
  
      const horarioFormateado = `${citaCompleta.horaInicio} - ${citaCompleta.horaFinal}`;
  
      const modalRef = this.modalService.open(DetalleCitaClienteComponent);
      modalRef.componentInstance.cita = {
        ...citaCompleta,
        fechaCita: fechaFormateada,
        horario: horarioFormateado,
        nombreCliente: citaCompleta.nombreCliente, // Pasar nombre del cliente
        aPCliente: citaCompleta.apellidoPaternoCliente, // Apellido paterno
        aMCliente: citaCompleta.apellidoMaternoCliente, // Apellido materno
      };
  
      modalRef.componentInstance.onCancelarCita.subscribe((idCita: number) => {
        this.cancelarCita(idCita);
      });
    } else {
    }
  }  

  cancelarCita(idCita: number): void {
    this.citaService.cancelarCita(idCita).subscribe(() => {
      this.getAllCitas();
    }, (err) => err);
  }
}
