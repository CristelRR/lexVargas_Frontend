import { ICommand } from './command.interface';
import { NotaService } from '../../services/nota.service';
import { Nota } from '../../models/notas';

export class SendEmailCommand implements ICommand {
  constructor(
    private notaService: NotaService,
    private nota: Nota,
    private tipoNota: string
  ) {}

  execute(): void {
    // Validar que la nota tiene un ID antes de enviar el correo
    if (!this.nota.idNota) {
      console.error('La nota no tiene un ID válido para enviar un correo.');
      return;
    }

    // Verificar si la nota es del tipo "urgente"
    if (this.tipoNota === 'urgente') {
      this.notaService.enviarCorreoNota(this.nota.idNota).subscribe({
        next: (response) => console.log('Correo enviado exitosamente:', response),
        error: (err) => console.error('Error al enviar el correo:', err),
      });
    } else {
    }
  }
}
