import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Agenda } from '../models/agenda';

@Injectable({
  providedIn: 'root'
})
export class AgendaService {

  constructor(private http: HttpClient) { }

  //URL_API = 'http://localhost:3000/agendas/';
  URL_API = 'https://3gwrmhh3-3000.usw3.devtunnels.ms/agendas/';
  //URL_API = 'https://3gwrmhh3-3000.usw3.devtunnels.ms/agendas/';

  public agenda: Agenda = {
    idAgenda: 0,
    horaInicio: '', 
    horaFinal: '', 
    fecha: '', 
    estado: '', 
    idEmpleadoFK: 0 
  };

  agendas: Agenda[] = [];

  // Obtener la lista de agendas
  getAgendas() {
    return this.http.get<Agenda[]>(this.URL_API);
  }

  // Crear un nuevo agenda
  crearAgenda(agenda: Agenda) {
    return this.http.post(this.URL_API, agenda);
  }

  // Actualizar agenda
  actualizarAgenda(agenda: Agenda) {
    return this.http.put(this.URL_API + agenda.idAgenda, agenda);
  }

  // Eliminar agenda
  eliminarAgenda(idAgenda: number) {
    return this.http.delete(this.URL_API+idAgenda);
  }
  
}
