//Archivo main.ts
import { ExpedienteArchivadoDecorator } from "./expediente-archivado.decorador";
import { ExpedienteConPrioridadDecorator } from "./expediente-con-prioridad.decorador";
import { UploadFileComponent } from "./upload-file.component";

const mockHttpClient = jasmine.createSpyObj('HttpClient', ['get', 'post']);
const mockClienteService = jasmine.createSpyObj('ClienteService', ['getClientes']);
const mockEmpleadoService = jasmine.createSpyObj('EmpleadoService', ['getAbogado']);

const expedienteBase = new UploadFileComponent(mockHttpClient, mockClienteService, mockEmpleadoService);
const expedienteConPrioridad = new ExpedienteConPrioridadDecorator(expedienteBase);
const expedienteArchivado = new ExpedienteArchivadoDecorator(expedienteConPrioridad);

try {
  expedienteArchivado.crearExpediente();
} catch (error) {
}
