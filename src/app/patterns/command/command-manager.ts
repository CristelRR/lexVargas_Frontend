import { ICommand } from './command.interface';

export class CommandManager {
  private commands: ICommand[] = [];

  registerCommand(command: ICommand): void {
    this.commands.push(command);
  }

  executeCommands(): void {
    for (const command of this.commands) {
      try {
        command.execute();
      } catch (error) {
        break; // Detener la ejecución si un comando falla
      }
    }
    this.commands = []; // Limpiar los comandos después de ejecutarlos
  }
}
