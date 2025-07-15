import { Component, OnInit } from '@angular/core';
import { CitaService } from '../../services/cita.service';
import { EspecialidadCita } from '../../models/especialidad-cita';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente';
import { BarraLateralComponent } from '../barra-lateral/barra-lateral.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServicioService } from '../../services/servicio.service';
import { Cita } from '../../models/cita';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';
import { Router } from '@angular/router';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-solicitud-cita',
  templateUrl: './solicitud-cita.component.html',
  styleUrls: ['./solicitud-cita.component.css'],
  standalone: true,
  imports: [
    BarraLateralComponent,
    FormsModule,
    CommonModule,
    BreadcrumbsComponent
  ]
})
export class SolicitudCitaComponent implements OnInit {
  especialidades: EspecialidadCita[] = [];
  selectedServicio: string = '';
  selectedHora: string = '';
  abogados: EspecialidadCita[] = [];
  cliente: Cliente | null = null;
  idAbogadoSeleccionado: number | null = null;
  servicioSeleccionado: number | null = null;
  horasDisponibles: { idAgenda: number; rango: string }[] = [];
  horaSeleccionada: string | null = null;
  fechasDisponibles: string[] = [];
  fechaSeleccionada: string | null = null;
  motivoCita: string = '';
  horarioSeleccionadoId: number | null = null;
  isSubmitting: boolean = false;  // Variable para controlar el estado de envío

  mensajeExito: string = '';  // Variable para mostrar mensaje de éxito

  constructor(
    public citaService: CitaService,
    public clienteService: ClienteService,
    public servicioService: ServicioService,
    private router: Router,
    private localStorageService: LocalStorageService,
  ) {}

  ngOnInit() {
    const userId = this.getUserId();
    if (userId) {
      this.getClienteById(userId);
      this.getServicios();
    } else {
      this.router.navigate(['/login']);  // Si no hay usuario logueado, redirigir a login
    }
  }

  getUserId(): number | null {
    if (typeof window !== 'undefined') {
      const usuarioId = this.localStorageService.getItem('usuarioId');
      return usuarioId ? parseInt(usuarioId, 10) : null;
    }
    return null;
  }

  getClienteById(idCliente: number | null) {
    if (idCliente) {
      this.clienteService.getClienteById(idCliente).subscribe(
        res => {
          this.cliente = res;
          this.fillClientData();
        },
      );
    }
  }

  fillClientData() {
    if (this.cliente) {
      const nombreInput = document.getElementById('nombre') as HTMLInputElement;
      const correoInput = document.getElementById('correo') as HTMLInputElement;
      const telefonoInput = document.getElementById('telefono') as HTMLInputElement;

      nombreInput.value = `${this.cliente.nombreCliente} ${this.cliente.aPCliente} ${this.cliente.aMCliente}`;
      correoInput.value = this.cliente.correo;
      telefonoInput.value = this.cliente.telefono;
    }
  }

  getServicios() {
    this.servicioService.getServicios().subscribe(
      res => {
        this.servicioService.servicios = res;
      },
    );
  }

  onServicioSeleccionado(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const servicioId = Number(selectElement.value);
    this.servicioSeleccionado = servicioId;
    this.cargarAbogadosPorServicio(servicioId);
  }

  cargarAbogadosPorServicio(servicioId: number) {
    this.citaService.getAbogadosPorServicio(servicioId).subscribe((data: EspecialidadCita[]) => {
      this.especialidades = data;
      this.idAbogadoSeleccionado = null;
      this.fechasDisponibles = [];
      this.horasDisponibles = [];
    }, error => {
    });
  }

  onAbogadoSeleccionado(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.idAbogadoSeleccionado = Number(selectElement.value);
    this.cargarFechasDisponiblesPorAbogado();
  }

  cargarFechasDisponiblesPorAbogado() {
    if (this.idAbogadoSeleccionado) {
      this.citaService.getHorariosDisponiblesPorAbogado(this.idAbogadoSeleccionado).subscribe(data => {
        const fechas = data.map(horario => {
          const fecha = new Date(horario.fecha);
          return fecha.toISOString().split('T')[0];
        });
        this.fechasDisponibles = [...new Set(fechas)];
        this.fechaSeleccionada = null;
        this.horasDisponibles = [];
      });
    }
  }

  onFechaSeleccionada(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.fechaSeleccionada = selectElement.value;

    if (this.fechaSeleccionada) {
      this.cargarHorariosDisponiblesPorFecha();
    }
  }

  cargarHorariosDisponiblesPorFecha() {
    if (this.idAbogadoSeleccionado && this.fechaSeleccionada) {
      this.citaService.getHorariosDisponiblesPorAbogado(this.idAbogadoSeleccionado).subscribe(data => {
        const horariosFiltrados = data.filter(horario => {
          const fechaHora = new Date(horario.fecha);
          return fechaHora.toISOString().split('T')[0] === this.fechaSeleccionada;
        });
        this.horasDisponibles = horariosFiltrados.map(horario => {
          const horaInicio = new Date(horario.horaInicio);
          const horaFin = new Date(horario.horaFinal);
          const horaInicioFormateada = this.formatTime(horaInicio.getUTCHours(), horaInicio.getUTCMinutes());
          const horaFinFormateada = this.formatTime(horaFin.getUTCHours(), horaFin.getUTCMinutes());
          return { idAgenda: horario.idAgenda, rango: `${horaInicioFormateada} - ${horaFinFormateada}` };
        });
      }, error => {
      });
    }
  }

  onHoraSeleccionada(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedHora = selectElement.value;

    const horarioSeleccionado = this.horasDisponibles.find(h => h.rango === selectedHora);
    if (horarioSeleccionado) {
      this.horarioSeleccionadoId = horarioSeleccionado.idAgenda;
    }

    this.horaSeleccionada = selectedHora;
  }

  formatTime(hours: number, minutes: number): string {
    const period = hours >= 12 ? 'PM' : 'AM';
    let formattedHours = hours % 12;
    if (formattedHours === 0) {
      formattedHours = 12;
    }
    const formattedMinutes = this.padZero(minutes);
    return `${formattedHours}:${formattedMinutes} ${period}`;
  }

  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  solicitarCita() {
    // Verificar que el campo motivo no esté vacío
    if (!this.motivoCita || this.motivoCita.trim() === '') {
      alert('Por favor, ingrese un motivo para la cita.');
      return;
    }

    // Verificar los demás campos obligatorios
    if (!this.servicioSeleccionado || !this.idAbogadoSeleccionado || !this.fechaSeleccionada || !this.horaSeleccionada) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    // Verificar que el cliente exista antes de continuar
    if (!this.cliente || !this.cliente.idCliente) {
      alert('Error: No se encontró el cliente. Por favor, asegúrese de estar registrado.');
      return;
    }

    // Desactivar el botón mientras se realiza la solicitud
    this.isSubmitting = true;

    const citaData: Cita = {
      motivo: this.motivoCita,
      estado: 'programada',
      idClienteFK: this.cliente.idCliente, // Se tiene certeza de que idCliente está definido aquí
      idServicioFK: this.servicioSeleccionado,
      idAgendaFK: this.horarioSeleccionadoId ?? 0,
      idAbogado: this.idAbogadoSeleccionado,
      fechaAgenda: this.fechaSeleccionada,
      horaInicio: this.horaSeleccionada.split(' - ')[0],
      horaFinal: this.horaSeleccionada.split(' - ')[1],
    };

    this.citaService.crearCitaConTransaccion(citaData).subscribe({
      next: () => {
        // Limpiar el formulario
        this.limpiarFormulario();

        // Mostrar mensaje de éxito en lugar de redirigir
        this.mensajeExito = 'La cita se ha guardado correctamente.';
        
      },
      error: (err) => {
        this.mensajeExito = 'Ocurrió un error al guardar la cita. Intenta nuevamente.';
      },
      complete: () => {
        // Reactivar el botón después de finalizar la solicitud
        this.isSubmitting = false;
      }
    });
  }

  limpiarFormulario() {
    this.motivoCita = '';
    this.servicioSeleccionado = null;
    this.idAbogadoSeleccionado = null;
    this.fechaSeleccionada = null;
    this.horaSeleccionada = null;
    this.horarioSeleccionadoId = null;
    this.especialidades = [];
    this.fechasDisponibles = [];
    this.horasDisponibles = [];
  }
}
