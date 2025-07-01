import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Componentes principales
import { HomeComponent } from './components/pagina-principal/home/home.component';
import { LoginComponent } from './components/pagina-principal/login/login.component';
import { RegisterComponent } from './components/pagina-principal/register/register.component';
import { RecuperacionContraseñaComponent } from './components/pagina-principal/recuperacion-contraseña/recuperacion-contraseña.component';
import { RestablecerContrasenaComponent } from './components/pagina-principal/restablecer-contrasena/restablecer-contrasena.component';
import { PrincipalComponent } from './components/principal/principal.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AvisoPrivacidadComponent } from './components/pagina-principal/aviso-privacidad/aviso-privacidad.component';

// Informativas
import { ConocenosComponent } from './components/pagina-principal/conocenos/conocenos.component';
import { ServiciosComponent } from './components/pagina-principal/servicios/servicios.component';
import { ContancosComponent } from './components/pagina-principal/contancos/contancos.component';
import { MapaSitioComponent } from './components/pagina-principal/mapa-sitio/mapa-sitio.component';

// Gestión
import { CrudEmpleadoComponent } from './components/cruds/crud-empleado/crud-empleado.component';
import { CrudClienteComponent } from './components/cruds/crud-cliente/crud-cliente.component';
import { GestionHorarioComponent } from './components/gestion-horario/gestion-horario.component';
import { GestionPagoComponent } from './components/gestion-pago/gestion-pago.component';
import { GestionCitaComponent } from './components/gestion-cita/gestion-cita.component';

// Citas
import { SolicitudCitaComponent } from './components/solicitud-cita/solicitud-cita.component';
import { RegistroCitasComponent } from './components/registro-citas/registro-citas.component';
import { CalendarioCitasClienteComponent } from './components/calendarios/calendario-citas-cliente/calendario-citas-cliente.component';
import { CalendarioCitasAbogadoComponent } from './components/calendarios/calendario-citas-abogado/calendario-citas-abogado.component';
import { CalendarioCitasSecretariaComponent } from './components/calendarios/calendario-citas-secretaria/calendario-citas-secretaria.component';

// Expedientes
import { UploadFileComponent } from './components/Expedientes/crear-expediente/crear-expediente.component';
import { VisualizarPdfComponent } from './components/Expedientes/visualizar-expediente/visualizar-expediente.component';
import { HistorialExpedienteComponent } from './components/Expedientes/historial-expediente/historial-expediente.component';
import { ExpedienteComponent } from './components/Expedientes/expediente/expediente.component';

// Navegación
import { NavbarComponent } from './components/navbar/navbar.component';
import { BarraLateralComponent } from './components/barra-lateral/barra-lateral.component';

// Páginas de error
import { NotFoundComponent } from './components/pages/not-found/not-found.component';
import { BadRequestComponent } from './components/pages/bad-request/bad-request.component';
import { ForbiddenComponent } from './components/pages/forbidden/forbidden.component';
import { PaymentRequiredComponent } from './components/pages/payment-required/payment-required.component';

// Servicio
import { NavigationHistoryService } from './services/navigation-history.service';
import { AuthGuard } from './guards/auth/auth.guard';
import { EditarPerfilComponent } from './components/pagina-principal/editar-perfil/editar-perfil.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  /** SIN INICIAR SESIÓN */
  { path: 'home', component: HomeComponent, data: { breadcrumb: 'Inicio' } },
  { path: 'principal-conocenos', component: ConocenosComponent, data: { breadcrumb: 'Conócenos' } },
  { path: 'principal-servicios', component: ServiciosComponent, data: { breadcrumb: 'Servicios' } },
  { path: 'principal-contactos', component: ContancosComponent, data: { breadcrumb: 'Contáctanos' } },
  { path: 'mapa-sitio', component: MapaSitioComponent, data: { breadcrumb: 'Mapa del Sitio' } },
  { path: 'aviso-privacidad', component: AvisoPrivacidadComponent, data: { breadcrumb: 'Aviso de Privacidad' } },

  { path: 'login', component: LoginComponent, data: { breadcrumb: 'Iniciar Sesión' } },
  { path: 'register', component: RegisterComponent, data: { breadcrumb: 'Registro' } },
  { path: 'recuperar-contrasena', component: RecuperacionContraseñaComponent, data: { breadcrumb: 'Recuperar Contraseña' } },
  { path: 'restablecer-contrasena/:token', component: RestablecerContrasenaComponent, data: { breadcrumb: 'Restablecer Contraseña' } },
  { path: 'restablecer', component: RestablecerContrasenaComponent, data: { breadcrumb: 'Restablecer Contraseña' } },

  /** CON INICIO DE SESIÓN */

  { path: 'principal', component: PrincipalComponent, data: { breadcrumb: 'Panel Principal' }, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, data: { breadcrumb: 'Configuración' }, canActivate: [AuthGuard] },
  { path: 'editar-perfil', component: EditarPerfilComponent, data: { breadcrumb: 'Editar Perfil' }, canActivate: [AuthGuard] },

  { path: 'empleado', component: CrudEmpleadoComponent, data: { breadcrumb: 'Gestión Empleados' }, canActivate: [AuthGuard] },
  { path: 'gestion-cliente', component: CrudClienteComponent, data: { breadcrumb: 'Gestión Clientes' }, canActivate: [AuthGuard] },
  { path: 'gestion-horario', component: GestionHorarioComponent, data: { breadcrumb: 'Gestión Horarios' }, canActivate: [AuthGuard] },
  { path: 'gestion-pago', component: GestionPagoComponent, data: { breadcrumb: 'Gestión Pagos' }, canActivate: [AuthGuard] },
  { path: 'gestion-cita', component: GestionCitaComponent, data: { breadcrumb: 'Gestión Citas' },canActivate: [AuthGuard] },

  { path: 'cita', component: SolicitudCitaComponent, data: { breadcrumb: 'Solicitar Cita' }, canActivate: [AuthGuard] },
  { path: 'citasRegistro', component: RegistroCitasComponent, data: { breadcrumb: 'Registro de Citas' }, canActivate: [AuthGuard] },
  { path: 'calendario-cliente', component: CalendarioCitasClienteComponent, data: { breadcrumb: 'Calendario Cliente' }, canActivate: [AuthGuard] },
  { path: 'calendario-abogado', component: CalendarioCitasAbogadoComponent, data: { breadcrumb: 'Calendario Abogado' }, canActivate: [AuthGuard] },
  { path: 'calendario-secretaria', component: CalendarioCitasSecretariaComponent, data: { breadcrumb: 'Calendario Secretaria' }, canActivate: [AuthGuard] },

  { path: 'crear-expediente', component: UploadFileComponent, data: { breadcrumb: 'Crear Expediente' }, canActivate: [AuthGuard] },
  { path: 'visualizar-expediente', component: VisualizarPdfComponent, data: { breadcrumb: 'Visualizar PDF' }, canActivate: [AuthGuard] },
  { path: 'historial-expedientes', component: HistorialExpedienteComponent, data: { breadcrumb: 'Historial Expedientes' }, canActivate: [AuthGuard] },
  { path: 'expediente/:idExpediente', component: ExpedienteComponent, data: { breadcrumb: 'Detalle Expediente' }, canActivate: [AuthGuard] },

  { path: 'barra', component: BarraLateralComponent, data: { breadcrumb: 'Barra Lateral' }, canActivate: [AuthGuard] },
  { path: 'navbar', component: NavbarComponent, data: { breadcrumb: 'Navegación' } },

  // Errores
  { path: 'error/400', component: BadRequestComponent, data: { breadcrumb: 'Error 400' } },
  { path: 'error/402', component: PaymentRequiredComponent, data: { breadcrumb: 'Error 402' } },
  { path: 'error/403', component: ForbiddenComponent, data: { breadcrumb: 'Error 403' } },

  // Ruta comodín
  { path: '**', component: NotFoundComponent, data: { breadcrumb: 'Página No Encontrada' } }
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forRoot(routes),
    NavbarComponent,
    UploadFileComponent,
  ],
  exports: [UploadFileComponent],
  providers: [NavigationHistoryService],
})
export class AppRoutingModule {}
