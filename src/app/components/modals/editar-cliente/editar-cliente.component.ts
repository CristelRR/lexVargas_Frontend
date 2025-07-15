import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Cliente } from '../../../models/cliente'; // Asegúrate de que la ruta sea correcta
import { ClienteService } from '../../../services/cliente.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editar-cliente',
  templateUrl: './editar-cliente.component.html',
  styleUrls: ['./editar-cliente.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ]
})
export class EditarClienteComponent implements OnInit {

  @Input() cliente: Cliente = {
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

  @Output() clienteActualizado = new EventEmitter<Cliente>(); // ✅ Tipo correcto
  @Output() cerrarModal = new EventEmitter<void>(); // Evento para cerrar el modal

  constructor(
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    // Inicializaciones adicionales si son necesarias
  }

  // Método para actualizar el cliente
  actualizarCliente(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.clienteService.actualizarCliente(this.cliente).subscribe(
      res => {
        this.clienteActualizado.emit(this.cliente); // ✅ Emitimos el cliente actualizado
        this.cerrarModal.emit(); // ✅ Cerramos el modal
      },
      err => {
        alert('Error al actualizar cliente: ' + err.message);
      }
    );
  }

  // Método para cerrar el modal sin guardar cambios
  cancelarEdicion(): void {
    this.cerrarModal.emit();
  }
}
