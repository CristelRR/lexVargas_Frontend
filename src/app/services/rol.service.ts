import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Rol } from '../models/rol';  // Asegúrate de que el path sea correcto

@Injectable({
  providedIn: 'root'
})
export class RolService {

  constructor(private http: HttpClient) { }

  //URL_API = 'http://localhost:3000/roles/';
  URL_API = 'https://mj5qrp25-3000.usw3.devtunnels.ms/roles/';

  public rol: Rol = {
    idRol: 0,
    nombreRol: ''
  };

  roles: Rol[] = [];

  // Obtener la lista de roles
  getRoles() {
    return this.http.get<Rol[]>(this.URL_API);
  }

  // Crear un nuevo rol
  crearRol(rol: Rol) {
    return this.http.post(this.URL_API, rol);
  }

  // Actualizar rol
  actualizarRol(rol: Rol) {
    return this.http.put(this.URL_API + rol.idRol, rol);
  }

  // Eliminar rol
  eliminarRol(idRol: number) {
    return this.http.delete(this.URL_API + idRol);
  }
}
