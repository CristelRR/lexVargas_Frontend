import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { BarraLateralComponent } from '../../barra-lateral/barra-lateral.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Expediente } from '../../../models/expediente';
import { ExpedienteService } from '../../../services/expediente.service';
import { DocumentosService } from '../../../services/documentos.service';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router'; 
import { CitaService } from '../../../services/cita.service';
import { NotaService } from '../../../services/nota.service';
import { Nota } from '../../../models/notas';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VerNotasModalComponent } from '../../modals/ver-notas/ver-notas.component';
import { CrearNotaModalComponent } from '../../modals/nueva-nota/nueva-nota.component';
import { CommandManager } from '../../../patterns/command/command-manager';
import { ValidateNoteCommand } from '../../../patterns/command/validate-note-command';
import { CreateNoteCommand } from '../../../patterns/command/create-note-command';
import { SendEmailCommand } from '../../../patterns/command/send-email-command';
import { BreadcrumbsComponent } from '../../breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-expediente',
  templateUrl: './expediente.component.html',
  styleUrls: ['./expediente.component.css'], // Ruta relativa correcta
  standalone: true,
  imports: [
    BarraLateralComponent,
    CommonModule,
    FormsModule,
    RouterModule,
    BreadcrumbsComponent
  ],
})
export class ExpedienteComponent implements OnInit {
  @Input() expedientes: any[] = [];
  @Input() categoriasDocumentos: any[] = [];
  subcategoriasDocumentos: any[] = [];
  modalVerNotaVisible: boolean = false;
  modalNuevaNotaVisible: boolean = false;
  notaSeleccionada: any = null; 

  citas: any[] = []; // Lista de citas
  loading: boolean = true; // Indicador de carga
  errorMessage: string | null = null; // Mensaje de error

  archivos: { documentoBase64: string; idCategoriaFK: number;  idSubCategoriaFK: number }[] = [];
  expedienteSeleccionado: any = null;
  categoriaSeleccionada: any = null;
  subCategoriaSeleccionada: any = null;

  idExpediente: number = 0; // Número de expediente a buscar
  expediente: Expediente | null = null;
  demandantes: any[] = []; // Lista de demandantes
  demandados: any[] = []; // Lista de demandados
  terceros: any[] = []; // Lista de terceros relacionados

  nuevaParte: any = {
    tipoParte: '',
    nombreCompleto: '',
    identificacionOficial: '',
    domicilio: '',
    telefono: '',
    correo: '',
    representanteLegalNombre: ''
  };
  citasCompletadas: any[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private expedienteService: ExpedienteService,
    private documentosService: DocumentosService,
    private modalService: NgbModal,
    private notaService: NotaService,
    private citaService: CitaService
  ) { }
  

  ngOnInit() {
  this.idExpediente = +this.activatedRoute.snapshot.paramMap.get('idExpediente')!;
  if (!this.idExpediente || isNaN(this.idExpediente)) {
    console.error('ID de expediente no válido');
    return;
  }
  
  // Inicializar las categorías y subcategorías
  this.categoriaSeleccionada = null; // Asegúrate de que no haya una categoría seleccionada inicialmente
  this.subCategoriaSeleccionada = null; // Lo mismo para la subcategoría

  this.getInformacionGeneral();
  this.getPartesRelacionadas();
  this.cargarCategoriasDocumentos();
  this.getCitasCompletadas();
  }

  getCitasCompletadas(): void {
    this.citaService.getCitasCompletadasByExpediente(this.idExpediente).subscribe(
      (citas) => {
        this.citasCompletadas = citas.map((cita) => {
          const horaInicio = cita.horaInicio
            ? new Date(cita.horaInicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
            : '';
          const horaFinal = cita.horaFinal
            ? new Date(cita.horaFinal).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
            : '';
          return {
            ...cita,
            horaInicio,
            horaFinal
          };
        });
      },
      (error) => {
        console.error('Error al obtener citas completadas:', error);
      }
    );
  }

  agregarParte() {
    if (!this.nuevaParte.tipoParte) {
      alert('Por favor, selecciona un tipo de parte.');
      return;
    }
  
    const parteData = {
      tipoParte: this.nuevaParte.tipoParte,
      parteData: { // 👈 CAMBIO AQUÍ (antes era "datos")
        idExpedienteFK: this.idExpediente,
        nombreCompleto: this.nuevaParte.nombreCompleto,
        identificacionOficial: this.nuevaParte.identificacionOficial,
        domicilio: this.nuevaParte.domicilio,
        telefono: this.nuevaParte.telefono,
        correo: this.nuevaParte.correo,
        representanteLegalNombre: this.nuevaParte.representanteLegalNombre,
        relacionCaso: 'Principal',
        numeroLicencia: '',
        representanteLegalTelefono: '',
        representanteLegalCorreo: ''
      }
    };
  
    this.expedienteService.agregarParte(this.idExpediente, parteData).subscribe({
      next: () => {
        alert('Parte agregada exitosamente.');
        this.resetFormularioParte();
        this.getPartesRelacionadas();
      },
      error: (err) => {
        console.error('Error al agregar parte:', err);
        alert(`Error al agregar parte: ${err.error?.message || err.message}`);
      }
    });
  }
  
  
  resetFormularioParte() {
    this.nuevaParte = {
      tipoParte: '',
      nombreCompleto: '',
      identificacionOficial: '',
      domicilio: '',
      telefono: '',
      correo: '',
      representanteLegalNombre: '',
      relacionCaso: 'Principal',
      fechaNacimiento: '',
      numeroLicencia: '',
      representanteLegalTelefono: '',
      representanteLegalCorreo: ''
    };
  }
  

  guardarPartes() {
    const idExpedienteStr = this.idExpediente.toString();
  
    const todasLasPartes = [
      ...this.demandantes.map(parte => ({
        tipoParte: 'Demandante',
        parteData: { ...parte, idExpedienteFK: this.idExpediente }
      })),
      ...this.demandados.map(parte => ({
        tipoParte: 'Demandado',
        parteData: { ...parte, idExpedienteFK: this.idExpediente }
      })),
      ...this.terceros.map(parte => ({
        tipoParte: 'Tercero',
        parteData: { ...parte, idExpedienteFK: this.idExpediente }
      }))
    ];
  
    todasLasPartes.forEach(parte => {
      this.expedienteService.agregarParte(idExpedienteStr, parte).subscribe({
        next: () => console.log(`Parte ${parte.tipoParte} guardada.`),
        error: (err) => console.error(`Error al guardar parte ${parte.tipoParte}:`, err),
      });
    });
  }

  getInformacionGeneral() {
    this.expedienteService.getInformacionGeneral(this.idExpediente).subscribe(
      (data) => {
        // Formatear la fecha antes de asignarla
        if (data.fechaApertura) {
          data.fechaApertura = this.formatearFecha(data.fechaApertura);
        }

        // Formatear el estado antes de asignarlo
        if (data.estado) {
          data.estado = this.formatearEstado(data.estado);
        }
        console.error('No se recibieron datos del expediente');
        this.expediente = data;
      },
      (error) => {
        console.error('Error al cargar expediente:', error);
        this.expediente = null;
      }
    );
  }

  // Obtener las partes relacionadas del expediente
  getPartesRelacionadas() {
    this.expedienteService.getPartesPorExpediente(this.idExpediente)
      .subscribe({
        next: (respuesta: any) => {
          this.demandantes = respuesta.demandantes || [];
          this.demandados = respuesta.demandados || [];
          this.terceros = respuesta.terceros || [];
        },
        error: (error) => {
          console.error('Error al cargar partes relacionadas:', error);
        }
      });
  }
  
  

  // Método para formatear la fecha
  formatearFecha(fecha: string): string {
    return fecha.split('T')[0]; // Extrae solo la parte de la fecha (YYYY-MM-DD)
  }

  // Método para formatear el estado
  formatearEstado(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'abierto':
        return 'Abierto';
      case 'proceso':
        return 'En Proceso';
      case 'cerrado':
        return 'Cerrado';
      case '  Archivado':
          return 'Archivado';
      case 'Prioridad Alta':
          return 'Prioridad Alta';
      default:
        return estado; // Por si acaso
    }
  }

  cargarCategoriasDocumentos() {
    this.documentosService.obtenerCategoriasDocumentos().subscribe({
      next: (categorias) => (this.categoriasDocumentos = categorias),
      error: (err) => console.error('Error al cargar categorías de documentos:', err),
    });
  }

  onCategoriaChange() {
    if (!this.categoriaSeleccionada) {
      return; // Evitar hacer la llamada si no hay categoría seleccionada
    }
  
    this.subCategoriaSeleccionada = null;
    this.documentosService.obtenerSubCategorias(this.categoriaSeleccionada.idCategoria).subscribe({
      next: (subcategorias) => {
        if (subcategorias && subcategorias.length > 0) {
          this.subcategoriasDocumentos = subcategorias;
        } else {
          this.subcategoriasDocumentos = []; // Asegurarse de que sea un array vacío si no hay subcategorías
        }
      },
      error: (err) => console.error('Error al cargar subcategorías:', err),
    });
  }
  
  

  onFileSelected(event: Event) {
    if (!this.subCategoriaSeleccionada || !this.categoriaSeleccionada) {
      alert('Por favor, selecciona una subcategoría y categoría antes de subir un archivo.');
      return;
    }
  
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      this.convertFileToBase64(file).then((base64) => {
        this.archivos.push({
          documentoBase64: base64,
          idCategoriaFK: this.categoriaSeleccionada.idCategoria, 
          idSubCategoriaFK: this.subCategoriaSeleccionada.idSubCategoria,
        });
        
        input.value = '';
  
        const respuesta = confirm('¿Quieres subir otro documento?');
        if (respuesta) {
          this.categoriaSeleccionada = null;
          this.subCategoriaSeleccionada = null;
        }
      });
    }
  }
  

  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Eliminar el prefijo antes de resolver
        const base64SinPrefijo = base64.split(',')[1]; 
        resolve(base64SinPrefijo);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  subirDocumentos() {
    if (!this.expedienteSeleccionado) {
      alert('Por favor, selecciona un expediente antes de continuar.');
      return;
    }
  
    const idExpedienteFK = this.expedienteSeleccionado.idExpediente;
    const idCategoriaFK = this.categoriaSeleccionada.idCategoria;
    const idSubCategoriaFK = this.subCategoriaSeleccionada.idSubCategoria;
    if (!idExpedienteFK) {
      alert('El expediente seleccionado no tiene un ID válido.');
      return;
    }
  
    this.documentosService.subirDocumentos1(idExpedienteFK, this.archivos, idCategoriaFK, idSubCategoriaFK).subscribe({
      next: (response) => {
        alert('¡Documentos subidos exitosamente!');
        this.resetearFormulario();
      },
      error: (err) => {
        console.error('Error al subir los documentos:', err);
        alert('Error al subir los documentos. Por favor, intenta nuevamente.');
      },
    });
  }

  resetearFormulario() {
    this.archivos = [];
    this.categoriaSeleccionada = null;
    this.subCategoriaSeleccionada = null;
    this.subcategoriasDocumentos = [];
  }
  abrirModalVerNotas(idCita: number): void {
    this.notaService.getNotasByCita(idCita).subscribe(
      (notas) => {
        if (notas.length > 0) {
          const modalRef = this.modalService.open(VerNotasModalComponent);
          modalRef.componentInstance.notas = notas; // Pasar la lista completa de notas
        } else {
          console.warn('No hay notas asociadas a esta cita');
        }
      },
      (error) => console.error('Error al cargar las notas:', error)
    );
  }
  
  cerrarModalVerNota() {
    this.notaSeleccionada = null;
    this.modalVerNotaVisible = false;
  }

  abrirModalNuevaNota(idExpediente: number, idCita: number): void {
    if (!idExpediente || !idCita) {
      console.error('Faltan parámetros obligatorios: idExpediente o idCita');
      return;
    }

    const modalRef = this.modalService.open(CrearNotaModalComponent);
    modalRef.componentInstance.idExpedienteFK = idExpediente;
    modalRef.componentInstance.idCitaFK = idCita;
  
    modalRef.componentInstance.notaCreada.subscribe((nuevaNota: Nota) => {
      const commandManager = new CommandManager();
  
      // Registrar comandos
      commandManager.registerCommand(new ValidateNoteCommand(idExpediente, idCita, nuevaNota));
      commandManager.registerCommand(new CreateNoteCommand(this.notaService, nuevaNota));
      commandManager.registerCommand(new SendEmailCommand(this.notaService, nuevaNota, nuevaNota.tipoNota));
  
      // Ejecutar comandos
      commandManager.executeCommands();
  
      // Opcional: actualizar la vista
      this.getCitasCompletadas();
    });
  }

  crearNota(nota: Nota): void {
    this.notaService.crearNota(nota).subscribe({
      next: (response) => {
        console.log('Nota creada exitosamente:', response);
      },
      error: (err) => {
        console.error('Error al crear la nota:', err);
      },
    });
  }

  guardarNota(nuevaNota: Nota): void {
    this.notaService.crearNota(nuevaNota).subscribe(
      (respuesta) => {
        // Refresca la lista de notas si es necesario
        this.abrirModalVerNotas(nuevaNota.idCitaFK!); // Refresca las notas de la cita
      },
      (error) => console.error('Error al guardar la nota:', error)
    );
  }
  cargarNotasExpediente(): void {
  this.notaService.getNotasByExpediente(this.idExpediente).subscribe(
    (notas) => {
      // Guarda las notas para mostrarlas en el HTML
      this.expedienteSeleccionado.notas = notas;
    },
    (error) => {
      console.error('Error al cargar las notas del expediente:', error);
    }
  );
}
}
