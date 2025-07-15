import { CitasStrategy } from './citas-strategy.interface';
import { CitaService } from '../../services/cita.service';
import { CitaAdaptada } from '../../models/cita-adaptada';
import { lastValueFrom } from 'rxjs';

export class ClienteCitasStrategy implements CitasStrategy<CitaAdaptada> {
  constructor(
    private citaService: CitaService,
    private onCitasLoaded: (citas: CitaAdaptada[]) => void
  ) {}

  async loadCitas(userId: number): Promise<CitaAdaptada[]> {
    try {
      const citas = await lastValueFrom(this.citaService.getCitasByCliente(userId));

      // Adaptar los datos para el cliente
      const citasAdaptadas: CitaAdaptada[] = citas.map(cita => ({
        idCita: cita.idCita,
        cliente: `${cita.nombreCliente} ${cita.aPCliente} ${cita.aMCliente}`, // <-- AÑADIR ESTO
        abogado: `${cita.abogadoNombre} ${cita.abogadoApellidoPaterno} ${cita.abogadoApellidoMaterno}`, // Visible solo para cliente
        horaInicio: cita.horaInicio,
        horaFinal: cita.horaFinal,
        nombreServicio: cita.nombreServicio,
        motivo: cita.motivo,
        fechaCita: cita.fechaCita, // Necesario para filtrado
        estadoCita: cita.estadoCita, // Necesario para filtrado
      }));
      

      // Llamar al callback con los datos adaptados
      this.onCitasLoaded(citasAdaptadas);

      // Retornar las citas adaptadas
      return citasAdaptadas;
    } catch (error) {
      throw error;
    }
  }
}
