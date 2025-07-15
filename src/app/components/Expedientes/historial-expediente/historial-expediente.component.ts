import { Component, OnInit, Inject, PLATFORM_ID, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UploadFileService } from '../../../services/upload-file.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { BarraLateralComponent } from '../../barra-lateral/barra-lateral.component';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BreadcrumbsComponent } from '../../breadcrumbs/breadcrumbs.component';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from "../../navbar/navbar.component";

declare var bootstrap: any;

@Component({
  selector: 'app-historial-expediente',
  standalone: true,
  imports: [
    BarraLateralComponent,
    CommonModule,
    FormsModule,
    RouterModule,
    BreadcrumbsComponent
],
  templateUrl: './historial-expediente.component.html',
  styleUrls: ['./historial-expediente.component.css'],
})
export class HistorialExpedienteComponent implements OnInit {
  expedientes: any[] = [];
  expedientesFiltrados: any[] = [];
  pdfSrc: SafeResourceUrl | null = null;
  terminoBusqueda: string = '';
  showScrollButton: boolean = false;
  lastScrollPosition: number = 0;
  navbarHidden: boolean = false;

  constructor(
    private http: HttpClient,
    private uploadFileService: UploadFileService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private sanitizer: DomSanitizer,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadExpedientes();
      this.initScrollEvents();
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      const currentScrollPosition = window.pageYOffset;
      
      // Mostrar/ocultar botón de scroll to top
      this.showScrollButton = currentScrollPosition > 300;
      
      // Ocultar/mostrar navbar al hacer scroll
      if (currentScrollPosition > this.lastScrollPosition && currentScrollPosition > 100) {
        this.navbarHidden = true;
      } else {
        this.navbarHidden = false;
      }
      this.lastScrollPosition = currentScrollPosition;
      
      // Efecto de aparición para las tarjetas
      this.animateCardsOnScroll();
    }
  }

  initScrollEvents() {
    if (isPlatformBrowser(this.platformId)) {
      // Inicializar animaciones para las tarjetas visibles al cargar
      setTimeout(() => this.animateCardsOnScroll(), 500);
    }
  }

  animateCardsOnScroll() {
    const cards = this.el.nativeElement.querySelectorAll('.card');
    cards.forEach((card: HTMLElement) => {
      const cardPosition = card.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.3;
      
      if (cardPosition < screenPosition) {
        this.renderer.addClass(card, 'card-visible');
      }
    });
  }

  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  onCardHover(event: MouseEvent): void {
    if (isPlatformBrowser(this.platformId)) {
      const card = event.target as HTMLElement;
      this.renderer.addClass(card, 'card-hover');
    }
  }

  onCardLeave(event: MouseEvent): void {
    if (isPlatformBrowser(this.platformId)) {
      const card = event.target as HTMLElement;
      this.renderer.removeClass(card, 'card-hover');
    }
  }

  loadExpedientes(): void {
    this.uploadFileService.getHistorialExpedienteCompleto().subscribe(
      (response: any[]) => {
        this.expedientes = response.map((expediente: any) => {
          const datosAbogado = expediente.datosAbogado ? JSON.parse(expediente.datosAbogado) : {};
          const datosAbogadoConcatenados = `${datosAbogado.nombreEmpleado || ''} ${datosAbogado.aPEmpleado || ''} ${datosAbogado.aMEmpleado || ''}, Licencia: ${datosAbogado.licencia || 'No registrada'}, Teléfono: ${datosAbogado.telefono || 'Sin teléfono'}`;

          const datosCliente = expediente.datosCliente ? JSON.parse(expediente.datosCliente) : {};
          const datosClienteConcatenados = `${datosCliente.nombreCliente || ''} ${datosCliente.aPCliente || ''} ${datosCliente.aMCliente || ''}, Dirección: ${datosCliente.direccion || 'No especificada'}, Teléfono: ${datosCliente.telefono || 'Sin teléfono'}, Correo: ${datosCliente.correo || 'Sin correo'}`;

          return {
            ...expediente,
            datosAbogado: datosAbogadoConcatenados,
            datosCliente: datosClienteConcatenados,
          };
        });

        this.expedientesFiltrados = [...this.expedientes];
      },
      (error: any) => {
      }
    );
  }

  buscar(): void {
    const termino = this.terminoBusqueda.toLowerCase().trim();

    if (termino === '') {
      this.expedientesFiltrados = [...this.expedientes];
    } else {
      this.expedientesFiltrados = this.expedientes.filter(expediente =>
        expediente.numeroExpediente.toLowerCase().includes(termino) ||
        expediente.nombreExpediente.toLowerCase().includes(termino) ||
        expediente.datosCliente.toLowerCase().includes(termino) ||
        expediente.datosAbogado.toLowerCase().includes(termino)
      );
    }
  }

  abrirModal(documentoBase64: string): void {
    if (!documentoBase64) {
      alert('El documento no está disponible.');
      return;
    }
    this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(`data:application/pdf;base64,${documentoBase64}`);
    const modalElement = document.getElementById('pdfModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  cerrarModal(): void {
    this.pdfSrc = null;
  }
}
