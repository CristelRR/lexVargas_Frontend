import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Empleado } from '../models/empleados';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {

  constructor(private http: HttpClient) { }

  //URL_API = 'http://localhost:3000/empleados/';
  URL_API = 'https://mj5qrp25-3000.usw3.devtunnels.ms/empleados/';

  public empleado: Empleado = {
    idEmpleado: 0,
    fechaIngreso: '',
    numeroLicencia: '',
    correo: '',
    nombreEmpleado: '',
    aPEmpleado: '',
    aMEmpleado: '',
    telefono: '',
    pass: '', 
    idRolFK: 0, 
    idEspecialidadFK: 0 
  };

  empleados: Empleado[] = [];

  // Obtener la lista de empleados
  getEmpleados() {
    return this.http.get<Empleado[]>(this.URL_API);
  }

  // Crear un nuevo empleado
  crearEmpleado(empleado: Empleado) {
    return this.http.post(this.URL_API, empleado);
  }

  // Actualizar un empleado existente
  actualizarEmpleado(empleado: Empleado): Observable<Empleado> {
    return this.http.put<Empleado>(`${this.URL_API}${empleado.idEmpleado}`, empleado);
  }


  // Eliminar empleado
  eliminarEmpleado(idEmpleado: number) {
    return this.http.delete(this.URL_API+idEmpleado);
  }

  //Obtener abogados
  getAbogado(){
    return this.http.get<Empleado[]>(`${this.URL_API}abogados`); 
  }

  getEmpleadoById(idEmplado: number) {
    return this.http.get<Empleado>(this.URL_API + idEmplado);
  }
  
}