import { Component, ElementRef, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { BarraLateralComponent } from '../barra-lateral/barra-lateral.component';
import { Pago } from '../../models/pagos';
import { PagoService } from '../../services/pago.service';
import { CommonModule } from '@angular/common';
import { BreadcrumbsComponent } from "../breadcrumbs/breadcrumbs.component";

declare var paypal: any;

@Component({
  selector: 'app-gestion-pago',
  standalone: true,
  imports: [
    FormsModule,
    BarraLateralComponent,
    CommonModule,
    BreadcrumbsComponent
],
  templateUrl: './gestion-pago.component.html',
  styleUrls: ['./gestion-pago.component.css']
})

export class GestionPagoComponent implements OnInit, AfterViewInit {
  
  constructor( private pagoService: PagoService) {}

  @ViewChild('paypal', { static: false }) paypalElement!: ElementRef;
 
  esCliente: boolean = true;
  fechaActual: string = '';
  cantidadPago: number = 0;
  pago: Pago[] = [];
  folio?: number;
  errorMessage: string = '';

  ngOnInit(): void {
    //localStorage.setItem('rolUsuario','Cliente');
    const rolUsuario = localStorage.getItem('rolUsuario');
    this.esCliente = (rolUsuario === 'Cliente');
    
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const año = hoy.getFullYear();
    this.fechaActual = `${año}-${mes}-${dia}`;

    this.obtenerPagos();
  }

  ngAfterViewInit(): void {
    if (this.paypalElement && this.esCliente) {
      paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [
              {
                amount: {
                  currency_code: 'MXN',
                  value: this.cantidadPago.toString()
                }
              }
            ]
          });
        },
        onApprove: async (data: any, actions: any) => {
          const order = await actions.order.capture();
          if (this.validarPago()) {
            this.pagarServicio();
            
            
          } else {
            Swal.fire({
                title: 'Error',
                text: 'El pago no se puede procesar debido a errores de validación.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                timer: 5000,
                timerProgressBar: true,
            });
            return; 
          }
        },
        onError: (err: any) => {
          // Cerrar el modal en caso de error
         
        
        }
      }).render(this.paypalElement.nativeElement);
    }
  }

  // Método auxiliar para obtener el monto inicial
private obtenerMontoInicial(): number | null {
  if (this.pago && this.pago.length > 0) {
      const ultimoPago = this.pago[this.pago.length - 1];

      // Verificar que montoRestante es un número
      if (typeof ultimoPago.montoRestante === 'number') {
        return ultimoPago.montoRestante;
    } else {
    }

  } else {
  }
  return null; // Indica que no se pudo obtener un monto inicial válido
}

esCantidadValida : boolean = false;
isValidPayment: boolean = false;
// Método para validar el pago
validarPago(): boolean {
  const montoInicial = this.obtenerMontoInicial();
  this.isValidPayment = true; // Reinicia la validez


  if (montoInicial === null) {
    this.isValidPayment = false;
      return false; // No se puede validar si no hay un monto inicial
  }

  if (montoInicial <= 0) {
    this.isValidPayment = false;
    this.esCantidadValida = false;
    return false;
}

  // Validar que la cantidad a pagar no sea mayor que el monto restante
  if (this.cantidadPago > montoInicial) {
      this.esCantidadValida = false;
      return false;
  }

  if (this.cantidadPago <= 0) {
    this.esCantidadValida = false;
    return false;
}
  this.esCantidadValida = true;
 
  return true; // Validación exitosa
}

// Método para procesar el pago
pagarServicio() {
  if (this.validarPago()) {
      const montoInicial = this.obtenerMontoInicial();

      if (montoInicial !== null) {
          let pagoInsert: Pago = {
              monto: this.cantidadPago,
              montoRestante: montoInicial - this.cantidadPago,
              metodo: localStorage.getItem('rolUsuario') == 'Cliente'?'PayPal':'Registro',
              estado: 1,
              fechaPago: this.fechaActual,
              idServicio: this.pago[0].idServicio,
              idCliente: this.pago[0].idCliente,
              nomCliente: this.pago[0].nomCliente,
              nomServicio: this.pago[0].nomServicio,
              montoInicial: montoInicial,
              folio: this.folio
          };

          this.pagoService.crearPago(pagoInsert).subscribe({
              next: () => {          
                  this.obtenerPagos();
                  Swal.fire({
                    title: '¡Pago realizado con éxito!',
                    text: 'Gracias por tu compra.',
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    timer: 5000,
                    timerProgressBar: true,
                  });
              },
              error: (error) => {
                  Swal.fire({
                    title: 'Error',
                    text: 'El pago no se puede procesar debido a errores de validación.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    timer: 5000,
                    timerProgressBar: true,
                  });
                 
              }
          });
      }
  } else {
  }
}


esFolio :boolean = false;
cargando: boolean = false;
  obtenerPagos(): void {
    if (!this.folio) {
      this.errorMessage = 'Por favor, ingresa un folio.';
      return;
    }
    this.cargando = true; 
    this.pagoService.getPagos(this.folio).subscribe({
      next: (data: Pago[]) => {
        this.cargando = false;  
        if (data.length === 0) {  // Verificar si el folio no devuelve resultados
          this.errorMessage = 'El folio no es válido.';
          this.esFolio = true;
          this.pago = [];  
      } else {
          this.pago = data;
          this.errorMessage = '';
          this.esFolio = false;  // El folio es válido
      }
  },
      error: (error) => {
        this.cargando = false; 
        this.errorMessage = 'Error al buscar el folio. Intenta nuevamente.';
        this.esFolio = false;
      }
    });
  }

  imprimirReferencia() {
    const input = document.getElementById('realizarPago');
    if (input) {
      html2canvas(input).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const doc = new jsPDF();

        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 20;
        const imgWidth = pageWidth - (2 * margin);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        doc.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
        doc.save('Referencia_de_pago.pdf');
      });
    }
  }

  imprimirExpediente() {
    const input = document.getElementById('formPagos');

    if (input) {
      html2canvas(input).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const doc = new jsPDF();

        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 20;
        const imgWidth = pageWidth - (2 * margin);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        doc.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
        doc.save('Expediente_de_pago.pdf');
      });
    }
  }


}
