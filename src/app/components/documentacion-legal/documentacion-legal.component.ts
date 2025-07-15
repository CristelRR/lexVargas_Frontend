import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentosService } from '../../services/documentos.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-documentacion-legal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documentacion-legal.component.html',
  styleUrls: ['./documentacion-legal.component.css'],
})
export class DocumentacionLegalComponent {
  @Input() expedientes: any[] = [];
  @Input() categoriasDocumentos: any[] = [];
  subcategoriasDocumentos: any[] = [];

  archivos: any[] = [];;
  expedienteSeleccionado: any = null;
  categoriaSeleccionada: any = null;
  subCategoriaSeleccionada: any = null;
  expediente: any; // Objeto para almacenar el expediente actual

  constructor(private http: HttpClient, private documentosService: DocumentosService) {}

  ngOnInit() {
    this.cargarExpedientes();
    this.cargarCategoriasDocumentos();
  }

  cargarExpedientes() {
    this.documentosService.obtenerExpedientes().subscribe({
      next: (expedientes) => (this.expedientes = expedientes),
      error: (err) => console.error('Error al cargar expedientes:', err),
    });
  }

  cargarCategoriasDocumentos() {
    this.documentosService.obtenerCategoriasDocumentos().subscribe({
      next: (categorias) => (this.categoriasDocumentos = categorias),
      error: (err) => console.error('Error al cargar categorías de documentos:', err),
    });
  }

  onCategoriaChange() {
    this.subCategoriaSeleccionada = null;
    this.documentosService.obtenerSubCategorias(this.categoriaSeleccionada.idCategoria).subscribe({
      next: (subcategorias) => (this.subcategoriasDocumentos = subcategorias),
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
          idCategoriaFK: this.categoriaSeleccionada.idCategoria, // Aquí agregas idCategoriaFK
          idSubCategoriaFK: this.subCategoriaSeleccionada.idSubCategoria,
        });
        
        input.value = '';
  
        // Mostrar la alerta después de agregar el archivo
        const respuesta = confirm('¿Quieres subir otro documento?');
        if (respuesta) {
          // Limpiar categoría y subcategoría si el usuario acepta
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
        alert('Error al subir los documentos. Por favor, intenta nuevamente.');
      },
    });
  }

  resetearFormulario() {
    this.archivos = [];
    this.expedienteSeleccionado = null;
    this.categoriaSeleccionada = null;
    this.subCategoriaSeleccionada = null;
    this.subcategoriasDocumentos = [];
  }
}
