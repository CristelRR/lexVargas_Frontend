import { ExpedienteComponent } from "./expediente.component";
import { ExpedienteDecoradorBase } from "./expediente.component";

export class ExpedienteArchivadoDecorator extends ExpedienteDecoradorBase {
  constructor(componente: ExpedienteComponent) {
    super(componente);
  }

  override crearExpediente(): void {
    (this.componente as any).expediente.estado = 'Archivado';
    alert('Expediente a sido Archivado.');
    
    super.crearExpediente();
  }
}
