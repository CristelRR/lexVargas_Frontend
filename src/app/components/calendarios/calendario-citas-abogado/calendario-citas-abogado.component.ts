import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaCita } from '../../../models/fechas-citas';
import { BarraLateralComponent } from '../../barra-lateral/barra-lateral.component';
import { CitaService } from '../../../services/cita.service';
import { DetalleCitaClienteComponent } from '../../modals/detalle-cita-cliente/detalle-cita-cliente.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ServicioService } from '../../../services/servicio.service';
import { Servicio } from '../../../models/servicio';
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
  description: string; // Horario de la cita
  estadoCita: string;   // Estado de la cita (programada, completada, cancelada)

}

@Component({
  selector: 'app-calendario-citas-abogado',
  templateUrl: './calendario-citas-abogado.component.html',
  styleUrls: ['./calendario-citas-abogado.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BarraLateralComponent,
    BreadcrumbsComponent
]
})
export class CalendarioCitasAbogadoComponent implements OnInit {

  diasDelMes: (number | null)[] = [];
  mesActual: number;
  anioActual: number;
  nombreMesActual: string;
  nombresDias: string[] = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  ];

  citas: FechaCitaExtendida[] = [];
  appointments: Appointment[] = [];
  servicios: Servicio[] = [];
  clientes: string[] = [];  // Lista de clientes
  filtroServicio: number | null = null;
  filtroCliente: string | null = null; // Nombre del cliente seleccionado
  filtroEstado: string | null = null;

  hoy: { dia: number, mes: number, anio: number };

  constructor(
    public citaService: CitaService,
    public modalService: NgbModal,
    public servicioService: ServicioService,
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
      this.getServiciosPorAbogado(userId);
      this.getCitasByAbogado(userId);
      this.getClientesPorAbogado(userId);  // Obtener lista de clientes específicos del abogado
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

  getServiciosPorAbogado(idAbogado: number): void {
    this.servicioService.getServiciosPorAbogado(idAbogado).subscribe(
      (res) => {
        this.servicios = res;
      },
      (err) => console.log('Error al obtener servicios por abogado:', err)
    );
  }

  // Método para obtener los clientes que tienen citas con el abogado
  getClientesPorAbogado(idAbogado: number): void {
    this.citaService.getClientesPorAbogado(idAbogado).subscribe(
      (clientes) => {
        this.clientes = clientes.map(cliente => `${cliente.nombreCliente} ${cliente.aPCliente} ${cliente.aMCliente}`);
      },
      (err) => console.log('Error al obtener clientes:', err)
    );
  }

  getCitasByAbogado(idAbogado: number): void {
    this.citaService.getCitasByAbogado(idAbogado).subscribe(
      (citas: FechaCita[]) => {
        console.log('Citas recibidas:', citas); // Imprime todas las citas recibidas para inspección
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

        this.filtrarCitas(); // Aplicar el filtro al cargar las citas
      }
    );
  }

  // Método de filtrado
  filtrarCitas(): void {
    const servicioIdFiltro = Number(this.filtroServicio);

    this.appointments = this.citas
        .filter((cita) => {
            const coincideServicio = !servicioIdFiltro || cita.idServicioFK === servicioIdFiltro;
            const coincideCliente = !this.filtroCliente || `${cita.nombreCliente} ${cita.aPCliente} ${cita.aMCliente}` === this.filtroCliente;
            const coincideEstado = !this.filtroEstado || cita.estadoCita === this.filtroEstado;

            return coincideServicio && coincideCliente && coincideEstado;
        })
        .map((cita) => {
            
            // Extrae solo la hora (HH:MM) de la cadena ISO
            const horaInicio = cita.horaInicio ? cita.horaInicio.split('T')[1].substring(0, 5) : '';
            const horaFinal = cita.horaFinal ? cita.horaFinal.split('T')[1].substring(0, 5) : '';
            
            return {
                idCita: cita.idCita,  // Agregar el ID de la cita para identificar cada evento único
                date: cita.date,
                month: cita.month,
                year: cita.year,
                description: `${horaInicio} - ${horaFinal}`, // Muestra solo el horario
                estadoCita: cita.estadoCita    // Añadir el estado de la cita para aplicar el estilo
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
    // Ahora busca la cita completa en base al idCita en lugar de solo la fecha
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
            this.getCitasByAbogado(userId);
        },
        (error) => {
            console.error('Error al cancelar la cita:', error);
        }
    );
  }

}
