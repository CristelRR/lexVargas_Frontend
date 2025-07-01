import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Servicio } from '../models/servicio';  // Asegúrate de que el path sea correcto
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {

  constructor(private http: HttpClient) { }

  //URL_API = 'http://localhost:3000/servicios/';
  URL_API = 'https://mj5qrp25-3000.usw3.devtunnels.ms/servicios/';


  public servicio: Servicio = {
    idServicio: 0,
    nombreServicio: '',
    descripcion: '',
    costo: 0
  };

  servicios: Servicio[] = [];

  // Obtener la lista de servicios
  getServicios() {
    return this.http.get<Servicio[]>(this.URL_API);
  }

  // Crear un nuevo servicio
  crearServicio(servicio: Servicio) {
    return this.http.post(this.URL_API, servicio);
  }

  // Actualizar servicio
  actualizarServicio(servicio: Servicio) {
    return this.http.put(this.URL_API + servicio.idServicio, servicio);
  }

  // Eliminar servicio
  eliminarServicio(idServicio: number) {
    return this.http.delete(this.URL_API + idServicio);
  }

  // Obtener servicios por abogado
  getServiciosPorAbogado(idAbogado: number): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.URL_API}/servicio-abogado/${idAbogado}`);
  }
}
