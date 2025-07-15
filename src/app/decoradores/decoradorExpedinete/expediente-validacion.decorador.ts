import { ExpedienteComponent, ExpedienteDecoradorBase } from "./expediente.component";

export class ExpedienteValidacionDecorator extends ExpedienteDecoradorBase {
    constructor(componente: ExpedienteComponent) {
      super(componente);
    }
  
    override crearExpediente(): void {
      const expediente = (this.componente as any).expediente;
  
      if (!expediente.numeroExpediente || !expediente.datosCliente.nombreCliente) {
        alert('Faltan datos obligatorios para crear el expediente.');
        return;
      }
  
      super.crearExpediente();
    }
  }
  