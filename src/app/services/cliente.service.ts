import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cliente } from '../models/cliente';  // Asegúrate de que el path sea correcto
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  constructor(private http: HttpClient) { }

  //URL_API = 'http://localhost:3000/clientes/';
  URL_API = 'https://mj5qrp25-3000.usw3.devtunnels.ms/clientes/';


  public cliente: Cliente = {
    idCliente: 0,
    nombreCliente: '',
    aPCliente: '',
    aMCliente: '',
    direccion: '',
    correo: '',
    telefono: '',
    pass: '', 
    idRolFK: 0 
  }; 

  clientes: Cliente[] = [];

  // Obtener la lista de clientes
  getClientes() {
    return this.http.get<Cliente[]>(this.URL_API);
  }

  // Crear un nuevo cliente
  crearCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.URL_API, cliente);
  }
  

  // Actualizar un empleado existente
  actualizarCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.URL_API}${cliente.idCliente}`, cliente);
  }

  // Eliminar cliente
  eliminarCliente(idCliente: number) {
    return this.http.delete(`${this.URL_API}${idCliente}`);
  }
  
  

  // Obtener cliente por ID
  getClienteById(idCliente: number) {
    return this.http.get<Cliente>(this.URL_API + idCliente);
  }
}
