import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Especialidad } from '../models/especialidad';  // Asegúrate de que el path sea correcto

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {

  constructor(private http: HttpClient) { }

  //URL_API = 'http://localhost:3000/especialidades/';
  URL_API = 'https://mj5qrp25-3000.usw3.devtunnels.ms/especialidades/';

  public especialidad: Especialidad = {
    idEspecialidad: 0,
    nombreEspecialidad: ''
  };

  public especialidades: Especialidad[] = [];

  // Obtener la lista de especialidades
  getEspecialidades() {
    return this.http.get<Especialidad[]>(this.URL_API);
  }

  // Crear una nueva especialidad
  crearEspecialidad(especialidad: Especialidad) {
    return this.http.post(this.URL_API, especialidad);
  }

  // Actualizar especialidad
  actualizarEspecialidad(especialidad: Especialidad) {
    return this.http.put(this.URL_API + especialidad.idEspecialidad, especialidad);
  }

  // Eliminar especialidad
  eliminarEspecialidad(idEspecialidad: number) {
    return this.http.delete(this.URL_API + idEspecialidad);
  }
}
