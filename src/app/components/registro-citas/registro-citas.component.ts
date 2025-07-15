import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CitaExpedienteService } from '../../services/cita-expediente.service';

@Component({
  selector: 'app-registro-citas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro-citas.component.html',
  styleUrls: ['./registro-citas.component.css']
})
export class RegistroCitasComponent implements OnInit {
  @Input() idExpediente!: number; // ID del expediente al que están asociadas las citas
  citas: any[] = []; // Lista de citas
  expediente: any; // Detalles del expediente
  citaForm!: FormGroup; // Formulario para crear cita

  constructor(private citaService: CitaExpedienteService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadExpediente();
    this.loadCitas();
  }

  // Inicializar el formulario
  initializeForm() {
    this.citaForm = this.fb.group({
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      motivo: ['', [Validators.required, Validators.maxLength(255)]],
      notas: [''],
      estado: ['Pendiente', Validators.required],
      idExpediente: [this.idExpediente]
    });
  }

  loadExpediente() {
    this.citaService.getExpediente().subscribe({
      next: (data) => {
        this.expediente = data.find((exp: any) => exp.idExpediente === this.idExpediente);
      },
      error: (err) => {
      }
    });
  }

  loadCitas() {
    if (this.idExpediente) {
      this.citaService.getCitasByExpediente(this.idExpediente).subscribe({
        next: (data) => {
          this.citas = data;
        },
        error: (err) => {
        }
      });
    }
  }

  // Crear una nueva cita
  crearCita() {
    if (this.citaForm.valid) {
      const nuevaCita = this.citaForm.value;
      this.citaService.crearCitaConExpediente(nuevaCita).subscribe({
        next: () => {
          this.loadCitas(); // Recargar citas después de crear una nueva
          this.citaForm.reset({ estado: 'Pendiente', idExpediente: this.idExpediente }); // Resetear formulario
        },
        error: (err) => {
        }
      });
    }
  }

  // Eliminar una cita
  eliminarCita(idCita: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
      this.citaService.eliminarCita(idCita).subscribe({
        next: () => {
          this.loadCitas(); // Recargar citas después de eliminar
        },
        error: (err) => {
        }
      });
    }
  }
}
