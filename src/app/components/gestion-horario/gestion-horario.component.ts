import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BarraLateralComponent } from '../barra-lateral/barra-lateral.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeleccionHorasComponent } from '../modals/seleccion-horas/seleccion-horas.component';
import { EmpleadoService } from '../../services/empleado.service';
import { Agenda } from '../../models/agenda';
import { AgendaService } from '../../services/agenda-service.service';
import { Empleado } from '../../models/empleados';
import { BreadcrumbsComponent } from "../breadcrumbs/breadcrumbs.component";

@Component({
  selector: 'app-gestion-horario',
  templateUrl: './gestion-horario.component.html',
  styleUrls: ['./gestion-horario.component.css'],
  standalone: true,
  imports: [
    BarraLateralComponent,
    CommonModule,
    FormsModule,
    BreadcrumbsComponent
]
})
export class GestionHorarioComponent implements OnInit {
  @Input() selectedAbogado!: {
    idEmpleado: number;
    nombreEmpleado: string;
    aPEmpleado: string;
    aMEmpleado: string;
  };
  diasDelMes: number[] = [];
  mesActual: number;
  anioActual: number;
  nombreMesActual: string;
  nombresDias: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  selectedFecha: Date | null = null;

  @ViewChild('modalMensaje') modalMensaje: any;

  constructor(
    private modalService: NgbModal,
    public empleadoService: EmpleadoService,
    public agendaService: AgendaService
  ) {
    const fecha = new Date();
    this.mesActual = fecha.getMonth();
    this.anioActual = fecha.getFullYear();
    this.nombreMesActual = this.obtenerNombreMes();
  }

  ngOnInit(): void {
    this.generarDiasDelMes();
    this.getAbogado();
  }

  getAbogado() {
    this.empleadoService.getAbogado().subscribe(
      res => {
        this.empleadoService.empleados = res;
      },
    );
  }

  seleccionarFecha(dia: number): void {
    if (dia !== 0) {
      this.selectedFecha = new Date(this.anioActual, this.mesActual, dia);
    }
  }

  abrirModal(): void {

    // Verificar si hay un abogado seleccionado
    if (!this.selectedAbogado) {
      alert('Por favor, selecciona un abogado antes de abrir el modal.');
      return;
    } else {
    }

    // Verificar si la fecha seleccionada es válida
    if (this.selectedFecha) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Establecer la hora a medianoche
      
      if (this.selectedFecha < hoy) {
        alert('No se pueden agendar horas para fechas anteriores a hoy.');
        return; // No abrir el modal
      } else {
      }
    } else {
    }

    const modalRef = this.modalService.open(SeleccionHorasComponent);
    modalRef.componentInstance.selectedAbogado = this.selectedAbogado;
    modalRef.componentInstance.selectedFecha = this.selectedFecha;

    modalRef.result.then((horasSeleccionadas: string[]) => {
      if (horasSeleccionadas) {
        this.guardarHoras(horasSeleccionadas);
      }
    }).catch(err => console.log('Error al cerrar el modal:', err));
  }

  cerrarModal() {
    this.modalService.dismissAll();
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

  generarDiasDelMes(): void {
    const primerDia = new Date(this.anioActual, this.mesActual, 1).getDay();
    const diasEnElMes = new Date(this.anioActual, this.mesActual + 1, 0).getDate();
    const inicioCalendario = (primerDia === 0) ? 6 : primerDia - 1;

    this.diasDelMes = Array.from({ length: 42 }, (_, i) => {
      if (i < inicioCalendario || i >= inicioCalendario + diasEnElMes) {
        return 0;
      }
      return i - inicioCalendario + 1;
    });
  }

  guardarHoras(horasSeleccionadas: string[]): void {
    const agendaData = horasSeleccionadas.map(hora => {
        const [inicio, fin] = hora.split(' - ');

        // Crear una nueva fecha basada en selectedFecha para la hora de inicio
        const horaInicio = new Date(this.selectedFecha!);
        const horaFinal = new Date(this.selectedFecha!);

        // Establecer la hora de inicio
        const [inicioHoras, inicioMinutos] = inicio.split(':').map(Number);
        horaInicio.setHours(inicioHoras, inicioMinutos, 0, 0); // Hora de inicio

        // Establecer la hora de fin
        const [finHoras, finMinutos] = fin.split(':').map(Number);
        horaFinal.setHours(finHoras, finMinutos, 0, 0); // Hora de fin

        // Convertir a ISO (esto ya será UTC)
        const horaInicioISO = new Date(horaInicio.getTime() - (horaInicio.getTimezoneOffset() * 60000)).toISOString();
        const horaFinalISO = new Date(horaFinal.getTime() - (horaFinal.getTimezoneOffset() * 60000)).toISOString();

        // Agregar logs para verificar los valores
        return {
            horaInicio: horaInicioISO,
            horaFinal: horaFinalISO,
            fecha: this.selectedFecha!.toISOString().split('T')[0], // Usa solo la fecha
            estado: 'Disponible',
            idEmpleadoFK: this.selectedAbogado.idEmpleado
        } as Agenda;
    });

    agendaData.forEach(agenda => {
        this.agendaService.crearAgenda(agenda).subscribe(
        );
    });
}






}
