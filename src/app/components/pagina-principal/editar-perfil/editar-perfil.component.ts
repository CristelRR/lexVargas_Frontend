import { Component, OnInit } from '@angular/core';
import { ClienteService } from '../../../services/cliente.service';
import { Cliente } from '../../../models/cliente';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbsComponent } from "../../breadcrumbs/breadcrumbs.component";
import { BarraLateralComponent } from "../../barra-lateral/barra-lateral.component";

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  templateUrl: './editar-perfil.component.html',
  styleUrls: ['./editar-perfil.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, BreadcrumbsComponent, BarraLateralComponent]
})
export class EditarPerfilComponent implements OnInit {
  clienteForm: FormGroup;
  cliente: Cliente | null = null;
  mensajeExito = '';

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private router: Router
  ) {
    this.clienteForm = this.fb.group({
      nombreCliente: [{ value: '', disabled: true }],
      aPCliente: [{ value: '', disabled: true }],
      aMCliente: [{ value: '', disabled: true }],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      direccion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = localStorage.getItem('usuarioId');
    if (id) {
      this.clienteService.getClienteById(+id).subscribe(res => {
        this.cliente = res;
        this.clienteForm.patchValue(res);
      });
    }
  }

  guardarCambios() {
    if (this.clienteForm.valid && this.cliente) {
      const datosActualizados = {
        ...this.cliente,
        correo: this.clienteForm.get('correo')?.value,
        telefono: this.clienteForm.get('telefono')?.value,
        direccion: this.clienteForm.get('direccion')?.value
      };
      this.clienteService.actualizarCliente(datosActualizados).subscribe(() => {
        this.mensajeExito = 'Perfil actualizado correctamente';
        setTimeout(() => this.router.navigate(['/principal']), 1500);
      });
    }
  }
}
