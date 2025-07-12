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
      if (value === null) {
        console.warn(`localStorage: No se encontró la clave "${key}".`);
      }
      return value;
    }

    console.warn(`localStorage no está disponible. Devolviendo mockStorage para la clave: ${key}`);
    return this.mockStorage[key] || null;
  }

  // Guardar valor en localStorage o mockStorage
  setItem(key: string, value: string | object): void {
    const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;

    if (this.isBrowser()) {
      localStorage.setItem(key, valueToStore);
    } else {
      console.warn(`localStorage no está disponible. Guardando en mockStorage la clave: ${key}`);
      this.mockStorage[key] = valueToStore;
    }
  }

  // Eliminar clave de localStorage o mockStorage
  removeItem(key: string): void {
    if (this.isBrowser()) {
      localStorage.removeItem(key);
    } else {
      console.warn(`localStorage no está disponible. Eliminando de mockStorage la clave: ${key}`);
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
