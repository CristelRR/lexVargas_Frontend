//Archivo upload-file.component.ts
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { EmpleadoService } from '../../services/empleado.service';
import { Cliente } from '../../models/cliente';
import { Empleado } from '../../models/empleados';
import { ExpedienteComponent } from './expediente.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-file',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss'],
})
export class UploadFileComponent implements ExpedienteComponent {
    fechaArchivado: string = '';
    clientes: Cliente[] = [];
    clienteSeleccionado: number | null = null
    clienteDatos: Cliente | null = null
  
    Abogado: Empleado[] = [];
    AbogadoSeleccionado: number | null = null
    AbogadoDatos: Empleado | null = null
    expediente: any = {
        numeroExpediente: '',
        estado: 'proceso',
        nombreServicio: '',
        descrpcion: '',
        datosAbogado: {
          nombreEmpleado: '',
          aPEmpleado: '',
          aMEmpleado: '',
          numeroLicencia: '',
          telfono: '',
          correo: ''
        },
        datosCliente: {
          nombreCliente: '',
          aPCliente: '',
          aMCliente: '',  
          direccion: '',
          telefono: '',
          correo: ''
        },
        fechaApertura: new Date().toISOString(),
        idClienteFK: 100006,
        idEmpleadoFK: 1007,
      };
  
  constructor(
    private http: HttpClient,
    private clienteService: ClienteService,
    private empleadoService: EmpleadoService
  ) {}

  ngOnInit(): void {
    
    this.cargarClientes();
    this.cargarAbogado();
  }

  cargarClientes(): void {
    this.clienteService.getClientes().subscribe(
      (data: Cliente[]) => { this.clientes = data; },
      (error) => { console.error('Error al cargar clientes', error); }
    );
  }

  cargarAbogado(): void {
    this.empleadoService.getAbogado().subscribe(
      (data: Empleado[]) => { /* Asignar a la variable */ },
      (error) => { console.error('Error al cargar abogados', error); }
    );
  }

  seleccionarCliente(clienteId: number | null): void {
    if (clienteId === null) { console.error('Cliente no seleccionado'); return; }
    this.clienteSeleccionado = clienteId;
  }

  seleccionarAbogado(abogadoId: number | null): void {
    if (abogadoId === null) { console.error('Abogado no seleccionado'); return; }
    this.AbogadoSeleccionado = abogadoId;
  }

  crearExpediente(): void {
    console.log('Crear expediente', this.expediente);
  }
}