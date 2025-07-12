import { CitasStrategy } from './citas-strategy.interface';
import { CitaService } from '../../services/cita.service';
import { CitaAdaptada } from '../../models/cita-adaptada';
import { lastValueFrom } from 'rxjs';

export class SecretariaCitasStrategy implements CitasStrategy<CitaAdaptada> {
  constructor(
    private citaService: CitaService,
    private onCitasLoaded: (citas: CitaAdaptada[]) => void
  ) {}

  async loadCitas(userId: number): Promise<CitaAdaptada[]> {
    try {
      const citas = await lastValueFrom(this.citaService.getCitasBySecretaria());
  
      // Imprime las citas recibidas desde el backend
  
      // Adaptar los datos para el rol de secretaria
      const citasAdaptadas: CitaAdaptada[] = citas.map(cita => {
        // Imprime cada cita antes de la adaptación
  
        return {
          idCita: cita.idCita,
          cliente: `${cita.nombreCliente || ''} ${cita.aPCliente || ''} ${cita.aMCliente || ''}`.trim(), // Concatenación segura
          abogado: `${cita.abogadoNombre} ${cita.abogadoApellidoPaterno} ${cita.abogadoApellidoMaterno}`, // Visible para secretaria
          horaInicio: cita.horaInicio,
          horaFinal: cita.horaFinal,
          nombreServicio: cita.nombreServicio,
          motivo: cita.motivo,
          fechaCita: cita.fechaCita, // Necesario para filtrado
          estadoCita: cita.estadoCita, // Necesario para filtrado
        };
      });
  
      // Llama al callback con los datos adaptados
      this.onCitasLoaded(citasAdaptadas);
  
      // Retorna las citas adaptadas
      return citasAdaptadas;
    } catch (error) {
      console.error('Error al cargar citas para secretaria:', error);
      throw error;
    }
  }  
}
