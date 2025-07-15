import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private mockStorage: { [key: string]: string } = {};

  // Verifica si estamos en el navegador o en un entorno de servidor
  public isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // Obtener elemento del localStorage o mockStorage
  getItem(key: string): string | null {
  if (this.isBrowser()) {
    const value = localStorage.getItem(key);
    return value ?? null; // Devuelve null si no existe, sin mostrar mensajes
  }

  return this.mockStorage[key] ?? null;
}


  // Guardar valor en localStorage o mockStorage
  setItem(key: string, value: string | object): void {
    const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;

    if (this.isBrowser()) {
      localStorage.setItem(key, valueToStore);
    } else {
      this.mockStorage[key] = valueToStore;
    }
  }

  // Eliminar clave de localStorage o mockStorage
  removeItem(key: string): void {
    if (this.isBrowser()) {
      localStorage.removeItem(key);
    } else {
      delete this.mockStorage[key];
    }
  }

  // Limpia todo el almacenamiento (localStorage o mockStorage)
  clear(): void {
    if (this.isBrowser()) {
      localStorage.clear();
    } else {
      this.mockStorage = {};
    }
  }
}
