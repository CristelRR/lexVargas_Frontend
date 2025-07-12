import { ExpedienteComponent, ExpedienteDecoradorBase } from "./expediente.component";

export class ExpedientePlazoDecorator extends ExpedienteDecoradorBase {
    constructor(componente: ExpedienteComponent) {
      super(componente);
    }
  
    override crearExpediente(): void {
      const expediente = (this.componente as any).expediente;
      expediente.plazo = new Date(new Date().setDate(new Date().getDate() + 30)).toISOString();
  
      super.crearExpediente();
    }
  }
  