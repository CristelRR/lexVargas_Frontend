import { CitasStrategy } from './citas-strategy.interface';
import { CitaService } from '../../services/cita.service';
import { CitaAdaptada } from '../../models/cita-adaptada';
import { lastValueFrom } from 'rxjs';

export class AbogadoCitasStrategy implements CitasStrategy<CitaAdaptada> {
  constructor(
    private citaService: CitaService,
    private onCitasLoaded: (citas: CitaAdaptada[]) => void
  ) {}

  async loadCitas(userId: number): Promise<CitaAdaptada[]> {
    try {
      const citas = await lastValueFrom(this.citaService.getCitasByAbogado(userId));

      // Adaptar los datos para el rol de abogado
      const citasAdaptadas: CitaAdaptada[] = citas.map(cita => ({
        idCita: cita.idCita,
        cliente: `${cita.nombreCliente} ${cita.aPCliente} ${cita.aMCliente}`, // Visible solo para abogado
        horaInicio: cita.horaInicio,
        horaFinal: cita.horaFinal,
        nombreServicio: cita.nombreServicio,
        motivo: cita.motivo,
        fechaCita: cita.fechaCita, // Necesario para filtrado
        estadoCita: cita.estadoCita, // Necesario para filtrado
      }));
      

      // Llama al callback con los datos adaptados
      this.onCitasLoaded(citasAdaptadas);

      // Retorna las citas adaptadas
      return citasAdaptadas;
    } catch (error) {
      throw error;
    }
  }
}
