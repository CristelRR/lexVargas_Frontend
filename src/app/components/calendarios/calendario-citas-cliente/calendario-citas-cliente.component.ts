import { Component, OnInit } from '@angular/core';
import { BarraLateralComponent } from '../../barra-lateral/barra-lateral.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../../services/cita.service';
import { FechaCita } from '../../../models/fechas-citas';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DetalleCitaClienteComponent } from '../../modals/detalle-cita-cliente/detalle-cita-cliente.component';
import { BreadcrumbsComponent } from "../../breadcrumbs/breadcrumbs.component";
import { LocalStorageService } from '../../../services/local-storage.service';

interface FechaCitaExtendida extends FechaCita {
  date: number;
  month: number;
  year: number;
  estadoCita: string;
}

interface Appointment {
  idCita: number;
  date: number;
  month: number;
  year: number;
  description: string;
  estadoCita: string;
}

@Component({
  selector: 'app-calendario-citas-cliente',
  templateUrl: './calendario-citas-cliente.component.html',
  styleUrls: ['./calendario-citas-cliente.component.css'],
  standalone: true,
  imports: [
    BarraLateralComponent,
    CommonModule,
    FormsModule,
    BreadcrumbsComponent
]
})
export class CalendarioCitasClienteComponent implements OnInit {
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
  filtroServicio: number | null = null;
  filtroEstado: string | null = null;
  hoy: { dia: number, mes: number, anio: number };

  constructor(
    public citaService: CitaService,
    public modalService: NgbModal,
    private localStorageService: LocalStorageService,
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
    const userId = this.getUserId();
    if (userId !== null) {
      this.getServiciosPorCitasDeCliente(userId);
      this.getCitasByCliente(userId);
    }
    this.generarDiasDelMes();
  }

  getUserId(): number | null {
    if (typeof window !== 'undefined') {
      const usuarioId = this.localStorageService.getItem('usuarioId');
      return usuarioId ? parseInt(usuarioId, 10) : null;
    }
    return null;
  }

  // Método para obtener los servicios únicos asociados a las citas del cliente
  getServiciosPorCitasDeCliente(idCliente: number): void {
    this.citaService.getServiciosPorCitasDeCliente(idCliente).subscribe(
      (res) => {
        this.servicios = res;
      },
      (err) => console.error('Error al obtener servicios de las citas del cliente:', err)
    );
  }

  getCitasByCliente(idCliente: number): void {
    this.citaService.getCitasByCliente(idCliente).subscribe(
      (citas: FechaCita[]) => {
        this.citas = citas.map((cita) => {
          const fecha = cita.fechaCita || cita.fechaAgenda;
          const parsedDate = fecha ? new Date(fecha) : null;

          return {
            ...cita,
            date: parsedDate?.getUTCDate() ?? NaN,
            month: parsedDate?.getUTCMonth() ?? NaN,
            year: parsedDate?.getUTCFullYear() ?? NaN,
          } as FechaCitaExtendida;
        });
        this.filtrarCitas();
      }
    );
  }

  filtrarCitas(): void {
    const servicioIdFiltro = this.filtroServicio ? Number(this.filtroServicio) : null;

    this.appointments = this.citas
      .filter((cita) => {
        const coincideServicio = !servicioIdFiltro || cita.idServicioFK === servicioIdFiltro;
        const coincideEstado = !this.filtroEstado || cita.estadoCita === this.filtroEstado;

        return coincideServicio && coincideEstado;
      })
      .map((cita) => {
        const horaInicio = cita.horaInicio ? cita.horaInicio.split('T')[1].substring(0, 5) : '';
        const horaFinal = cita.horaFinal ? cita.horaFinal.split('T')[1].substring(0, 5) : '';

        return {
          idCita: cita.idCita,
          date: cita.date,
          month: cita.month,
          year: cita.year,
          description: `${horaInicio} - ${horaFinal}`,
          estadoCita: cita.estadoCita
        };
      });
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

      const horaInicio = citaCompleta.horaInicio.slice(11, 16);
      const horaFinal = citaCompleta.horaFinal.slice(11, 16);
      const horarioFormateado = `${horaInicio} - ${horaFinal}`;

      const modalRef = this.modalService.open(DetalleCitaClienteComponent);
      modalRef.componentInstance.cita = {
        ...citaCompleta,
        fechaCita: fechaFormateada,
        horario: horarioFormateado
      };

      // Escuchar el evento onCancelarCita
      modalRef.componentInstance.onCancelarCita.subscribe((idCita: number) => {
        this.cancelarCita(idCita);
    });
    } else {
      console.error('No se encontró la cita completa para el modal');
    }
  }

  cancelarCita(idCita: number): void {
    const userId = this.getUserId();
    if (!userId) return;

    this.citaService.cancelarCita(idCita).subscribe(
        (response) => {
            // Actualizar la lista de citas después de la cancelación
            this.getCitasByCliente(userId);
        },
        (error) => {
            console.error('Error al cancelar la cita:', error);
        }
    );
  }
}
