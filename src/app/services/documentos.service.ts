import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentosService {

  //private apiUrl = 'http://localhost:3000/documentos';
  private apiUrl = 'https://mj5qrp25-3000.usw3.devtunnels.ms/documentos';

    constructor(private http: HttpClient) {}

    subirDocumentos1(idExpediente: number, archivos: any[], idCategoria: number, idSubCategoria: number) {
      const url = `${this.apiUrl}/subirDocumento`;
      const payload = {
        idExpedienteFK: idExpediente,
        documentos: archivos.map(archivo => ({
          documentoBase64: archivo.documentoBase64,
          idCategoriaFK: archivo.idCategoriaFK || idCategoria,
          idSubCategoriaFK: archivo.idSubCategoriaFK || idSubCategoria          
        }))     
      };
      console.log(payload)
      return this.http.post(url, payload);
    }
    
    
  obtenerExpedientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/obtenerExp`);
  }

  obtenerCategoriasDocumentos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/obtenerCategoriasYSubcategorias`);
  }
  obtenerSubCategorias(idCategoria: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/obtenerSubCategorias/${idCategoria}`);
  }
}
