import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PdfViewerService {

  private readonly URL_API = 'http://localhost:3000/expedientes/documento/';
  //private readonly URL_API = 'https://mj5qrp25-3000.usw3.devtunnels.ms/expedientes/documento/';

  constructor(private http: HttpClient) {}

  // Método para obtener el PDF en Base64 por ID
  getPdfDocument(id: number): Observable<any> {
    return this.http.get<any>(`${this.URL_API}${id}`);
  }
}
