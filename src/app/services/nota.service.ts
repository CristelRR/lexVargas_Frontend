import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Nota } from '../models/notas'; // Asegúrate de crear este modelo si aún no existe

@Injectable({
  providedIn: 'root'
})
export class NotaService {
  private URL_API = 'http://localhost:3000/notas'; // La URL base para las notas
  //private URL_API = 'https://mj5qrp25-3000.usw3.devtunnels.ms/notas/';

  constructor(private http: HttpClient) { }

  // Obtener todas las notas
  getNotas(): Observable<Nota[]> {
    return this.http.get<Nota[]>(this.URL_API);
  }

  // Obtener notas por ID de expediente
  getNotasByExpediente(idExpediente: number): Observable<Nota[]> {
    return this.http.get<Nota[]>(`${this.URL_API}/expediente/${idExpediente}`);
  }

  // Crear una nueva nota
  crearNota(nota: Nota): Observable<Nota> {
    return this.http.post<Nota>(`${this.URL_API}`, nota);
  }

  // Actualizar una nota
  updateNota(notaData: Nota): Observable<Nota> {
    return this.http.put<Nota>(`${this.URL_API}/actualizar`, notaData);
  }

  // Eliminar una nota por su ID
  deleteNota(idNota: number): Observable<void> {
    return this.http.delete<void>(`${this.URL_API}/eliminar/${idNota}`);
  }

  // Obtener nota por cita
  getNotasByCita(idCita: number): Observable<Nota[]> {
    return this.http.get<Nota[]>(`${this.URL_API}/cita/${idCita}`);
  }

  // Enviar un correo basado en una nota
  enviarCorreoNota(idNota: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.URL_API}/enviar-correo/${idNota}`, {});
  }

}
