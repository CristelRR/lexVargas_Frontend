import { ExpedienteComponent } from "./expediente.component";
import { ExpedienteDecoradorBase } from "./expediente.component";

export class ExpedienteConPrioridadDecorator extends ExpedienteDecoradorBase {
  constructor(componente: ExpedienteComponent) {
    super(componente);
  }

  override crearExpediente(): void {
    (this.componente as any).expediente.estado = 'Prioridad Alta';

    alert('Expediente a sido Prioridad Alta.');
    
    super.crearExpediente();
  }
}
