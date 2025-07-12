//componte upload-file-component.ts
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UploadFileService } from '../../../services/upload-file.service';
import { FormsModule } from '@angular/forms';
import { BarraLateralComponent } from '../../barra-lateral/barra-lateral.component';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../../services/cliente.service';
import { Cliente } from '../../../models/cliente';
import { EmpleadoService } from '../../../services/empleado.service';
import { Empleado } from '../../../models/empleados';
import { ExpedienteComponent } from '../../../decoradores/decoradorExpedinete/expediente.component';
import { ExpedienteConPrioridadDecorator } from '../../../decoradores/decoradorExpedinete/expediente-con-prioridad.decorador';
import { ExpedienteArchivadoDecorator } from '../../../decoradores/decoradorExpedinete/expediente-archivado.decorador';
import { BreadcrumbsComponent } from '../../breadcrumbs/breadcrumbs.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-upload-file',
  standalone: true,
  imports: [
    BarraLateralComponent,
    CommonModule,
    FormsModule,
    BreadcrumbsComponent,
    RouterModule
  ],
  templateUrl: './crear-expediente.component.html',
  styleUrls: ['./crear-expediente.component.scss'],
})
export class UploadFileComponent implements ExpedienteComponent{
  expedienteDecorado: ExpedienteComponent | null = null;
  clientes: Cliente[] = [];  // Lista de clientes
  clienteSeleccionado: number | null = null;  // ID del cliente seleccionado
  clienteDatos: Cliente | null = null;  // Datos del cliente seleccionado

  Abogado: Empleado[] = [];
  AbogadoSeleccionado: number | null = null;
  AbogadoDatos: Empleado | null = null;
  
  expediente: any = {
    numeroExpediente: '',
    estado: 'En Proceso',
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
  documentos: string[] = [
    'CURP',
    'Curriculum Vitae',
    'Comprobante de Domicilio',
    'Número de Seguridad Social (IMSS)',
    'Identificación Oficial'
  ];
  fechaArchivado: string = '';

  idExpedienteCreado: number | null = null;

  expedientes: any[] = [];
  nuevoExpediente: any = {
    nombreExpediente: '',
    numeroExpediente: '',
    descripcion: '',
    estado: 'En Proceso',
    datosAbogado: {},
    datosCliente: {}
  };
  mostrarFormulario: boolean = false;
  expedienteAEliminar: any = null;

  cargando = false;
  errorCarga: string | null = null;

  expedienteCreado = false;

  nombreDelExpediente: string = '';

  serviciosDisponibles: string[] = [
    'Asesoría Legal',
    'Redacción de Contratos',
    'Juicio Civil',
    'Juicio Penal',
    'Divorcio',
    'Testamentos',
    'Registro de Marca',
    'Defensa Laboral'
  ];

  AbogadoAsignado: Empleado | null = null;

  constructor(
    private http: HttpClient,
    private uploadFileService: UploadFileService,
    private clienteService: ClienteService,
    private empleadiService: EmpleadoService,
    private modalService: NgbModal
    ) {}

   ngOnInit(): void {
    this.cargarClientes();  // Cargar los clientes al inicializar el componente
    this.cargarAbogado();  // Cargar los abogados
    this.cargarExpedientes();
    this.cargarAbogadoLogueado()
  }

  cargarAbogadoLogueado(): void {
    const usuarioId = this.getUserId();
    
    if (usuarioId) {
      this.empleadiService.getEmpleadoById(usuarioId).subscribe(
        (abogado: Empleado) => {
          this.AbogadoAsignado = abogado;
          this.expediente.idEmpleadoFK = abogado.idEmpleado;
          
          // Llenar automáticamente los datos del abogado en el expediente
          this.expediente.datosAbogado = {
            nombreEmpleado: abogado.nombreEmpleado,
            aPEmpleado: abogado.aPEmpleado,
            aMEmpleado: abogado.aMEmpleado,
            numeroLicencia: abogado.numeroLicencia || 'No registrada',
            telfono: abogado.telefono || 'Sin teléfono',
            correo: abogado.correo
          };
          
        },
        (error) => {
          console.error('Error al cargar abogado:', error);
          // Manejar el error adecuadamente
        }
      );
    } else {
      console.error('No se encontró ID de usuario en localStorage');
    }
  }

  getUserId(): number | null {
    if (typeof window !== 'undefined') {
      const usuarioId = localStorage.getItem('usuarioId');
      return usuarioId ? parseInt(usuarioId, 10) : null;
    }
    return null;
  }

  cargarExpedientes(): void {
    this.cargando = true;
    
    this.uploadFileService.obtenerExpedientes().subscribe({
      next: (data) => {
        this.expedientes = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
        // Puedes mostrar un toast o mensaje flotante en lugar de usar el alert
      }
    });
  }

  mostrarFormularioNuevo(): void {
    this.mostrarFormulario = true;
    this.resetearExpediente();
  }

  resetearExpediente() {
    this.expediente = {
      numeroExpediente: '',
      estado: 'En Proceso',
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
  
    this.clienteSeleccionado = null;
    this.AbogadoSeleccionado = null;
    this.clienteDatos = null;
    this.AbogadoDatos = null;
    this.idExpedienteCreado = null;
  }
  

  agregarExpediente(nuevoExpediente: any): void {
    this.cargando = true;
    
    this.uploadFileService.crearExpediente(nuevoExpediente).subscribe({
      next: (response) => {
        this.expedientes.unshift(response);
        this.cargando = false;
      },
      error: (err) => {
        this.errorCarga = 'Error al crear expediente';
        this.cargando = false;
      }
    });
  }

  abrirModalEliminar(modal: any, expediente: any): void {
    this.expedienteAEliminar = expediente;
    this.modalService.open(modal);
  }

  eliminarExpediente(id: string): void {
    if (confirm('¿Está seguro de eliminar este expediente?')) {
      this.cargando = true;
      
      this.uploadFileService.eliminarExpediente(id).subscribe({
        next: () => {
          this.expedientes = this.expedientes.filter(e => e.id !== id);
          this.cargando = false;
        },
        error: (err) => {
          this.errorCarga = 'Error al eliminar expediente';
          this.cargando = false;
        }
      });
    }
  }

  confirmarEliminacion(): void {
    if (!this.expedienteAEliminar) return;

    this.uploadFileService.eliminarExpediente(this.expedienteAEliminar.idExpediente).subscribe({
      next: () => {
        this.expedientes = this.expedientes.filter(e => e.idExpediente !== this.expedienteAEliminar.idExpediente);
        this.modalService.dismissAll();
        alert('Expediente eliminado correctamente');
      },
      error: (error) => {
        console.error('Error al eliminar expediente:', error);
        alert('Error al eliminar el expediente');
      }
    });
  }

  cargarAbogado(): void {
    this.empleadiService.getAbogado().subscribe(
      (data: Empleado[]) => {
        this.Abogado = data;  // Almacenar los abogados obtenidos en la variable Abogado
      },
      (error) => {
        console.error('Error al obtener los abogados', error);
      }
    );
  }
  
  aplicarDecorador(tipo: string): void {
    switch (tipo) {
      case 'prioridad':
        this.expediente.estado = 'Prioridad Alta';
        break;
      case 'archivado':
        this.expediente.estado = 'Archivado';
        break;
    }
    // No necesitamos recargar toda la lista, el cambio se verá al crear el expediente
  }
   
  cargarClientes(): void {
    this.clienteService.getClientes().subscribe(
      (data: Cliente[]) => {
        this.clientes = data;
      },
      (error) => {
        console.error('Error al obtener los clientes', error);
      }
    );
  }

  cargarDatosCliente(): void {
    if (this.clienteSeleccionado) {
      this.clienteService.getClienteById(this.clienteSeleccionado).subscribe(
        (data: Cliente) => {
          this.clienteDatos = data;
          this.expediente.datosCliente = {
            nombreCliente: data.nombreCliente,
            aPCliente: data.aPCliente,
            aMCliente: data.aMCliente,
            direccion: data.direccion,
            telefono: data.telefono,
            correo: data.correo
          };
          
          // Generar nombre y número de expediente
          const nombreCompleto = `${data.nombreCliente} ${data.aPCliente} ${data.aMCliente}`;
          const añoActual = new Date().getFullYear();
          
          this.expediente.nombreExpediente = nombreCompleto;
          this.expediente.numeroExpediente = `EXP-${data.idCliente}-${añoActual}`;
          this.expediente.idClienteFK = data.idCliente;
        },
        (error) => {
          console.error('Error al obtener los datos del cliente', error);
        }
      );
    }
  }
  

  cargarDatosAbogado(): void {
    if (this.AbogadoSeleccionado) {
      this.empleadiService.getEmpleadoById(this.AbogadoSeleccionado).subscribe(
        (data: Empleado) => {
          this.AbogadoDatos = data;
          
          // Asignar los datos del abogado al expediente
          this.expediente.datosAbogado = {
            nombreAbogado: data.nombreEmpleado,
            aPAbogado: data.aPEmpleado,
            aMAbogado: data.aMEmpleado,
            licencia: data.numeroLicencia ? data.numeroLicencia : 'No registrada', // Si no tiene licencia, asigna 'No registrada'
            telefono: data.telefono ? data.telefono : 'Sin teléfono', // Si no tiene teléfono, asigna 'Sin teléfono'
            correo: data.correo // Si tiene correo, lo asignamos
          };
  
          // Agregar el nombre del abogado al nombre del expediente
          this.expediente.nombreExpediente += ` - Abogado: ${data.nombreEmpleado} ${data.aPEmpleado} ${data.aMEmpleado}`;
  
          // Asignar el ID del abogado al expediente
          this.expediente.idEmpleadoFK = data.idEmpleado;
  
          // Generar número de expediente automáticamente (en el mismo formato)
          this.expediente.numeroExpediente = `EXP-${this.expediente.idClienteFK}-${new Date().getFullYear()}`;
        },
        (error) => {
          console.error('Error al obtener los datos del abogado', error);
        }
      );
    }
  }
  
  

  seleccionarAbogado(abogadoId: number | null): void {
    if (abogadoId === null) {
      console.error("Abogado no seleccionado");
      return;
    }
    this.AbogadoSeleccionado = abogadoId;
    const abogado = this.Abogado.find(a => a.idEmpleado === abogadoId);
    if (abogado) {
      this.expediente.idEmpleadoFK = abogado.idEmpleado;
      this.expediente.nombreExpediente += ` - Abogado: ${abogado.nombreEmpleado} ${abogado.aPEmpleado} ${abogado.aMEmpleado}`;
    }
  }

  seleccionarCliente(clienteId: number | null): void {
    if (clienteId === null) {
      console.error("Cliente no seleccionado");
      return;
    }
    this.clienteSeleccionado = clienteId;
    const cliente = this.clientes.find(c => c.idCliente === clienteId);
    if (cliente) {
      this.expediente.idClienteFK = cliente.idCliente;
      this.expediente.nombreExpediente = `${cliente.nombreCliente} ${cliente.aPCliente} ${cliente.aMCliente}`;
    }
  }
  

  crearExpediente() {
    if (this.cargando) return;
  
    if (!this.expediente.idClienteFK || !this.expediente.idEmpleadoFK) {
      console.error('Debe seleccionar un cliente y un abogado antes de crear el expediente.');
      return;
    }
  
    this.cargando = true;
  
    this.uploadFileService.crearExpediente(this.expediente).subscribe({
      next: (response: any) => {
        
        // Asegúrate que el objeto tenga las propiedades correctas
        const nuevoExpediente = {
          idExpediente: response.idExpediente,
          numeroExpediente: response.numeroExpediente || this.expediente.numeroExpediente,
          nombreExpediente: response.nombreExpediente || this.expediente.nombreExpediente,
          estado: response.estado || this.expediente.estado,
          fechaCreacion: response.fechaCreacion || new Date().toISOString()
        };
  
        this.expedientes.unshift(nuevoExpediente);
        this.idExpedienteCreado = response.idExpediente;
        this.mostrarMensajeExito();
        this.resetearExpediente();
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al crear el expediente:', err);
        this.cargando = false;
      }
    });
  }
  private mostrarMensajeExito() {
    const mensaje = this.expediente.estado === 'Prioridad Alta' ? 
      'Expediente creado con prioridad alta' :
      this.expediente.estado === 'Archivado' ?
      'Expediente archivado creado' :
      'Expediente creado exitosamente';
    
    alert(mensaje);
  }
  

  // subirDocumentos() {
  //   if (!this.idExpedienteCreado) {
  //     console.error('No se ha creado un expediente');
  //     return;
  //   }

  //   const documentos = Object.keys(this.archivos).map((tipoDocumento) => ({
  //     documentoBase64: this.archivos[tipoDocumento] || '',
  //     idTipoDocumentoFK: this.obtenerIdTipoDocumento(tipoDocumento),
  //   }));

  //   if (documentos.some(doc => !doc.documentoBase64)) {
  //     console.error('Todos los documentos deben estar seleccionados');
  //     return;
  //   }

  //   this.uploadFileService.subirDocumentos(this.idExpedienteCreado, documentos).subscribe({
  //     next: (response: any) => {
  //       console.log('Documentos subidos correctamente:', response);
  //     },
  //     error: (err: any) => {
  //       console.error('Error al subir los documentos:', err);
  //     }
  //   });
  // }

  // obtenerIdTipoDocumento(tipoDocumento: string): number {
  //   const tipoDocumentoIds: { [key: string]: number } = {
  //     'CURP': 1,
  //     'Curriculum Vitae': 2,
  //     'Comprobante de Domicilio': 3,
  //     'Número de Seguridad Social (IMSS)': 4,
  //     'Identificación Oficial': 5
  //   };
  //   return tipoDocumentoIds[tipoDocumento] || 0;
  // }

  onSubmit() {
    if (!this.expediente.numeroExpediente || !this.expediente.nombreServicio) {
      alert('Complete los campos requeridos');
      return;
    }
  
    const confirmacion = confirm('¿Crear expediente?');
    if (!confirmacion) return;
  
    this.crearExpediente(); // Siempre usa el método base, los decoradores ya modificaron el estado
  }
}
