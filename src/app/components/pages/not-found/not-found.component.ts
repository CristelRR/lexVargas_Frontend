import { Component } from '@angular/core';
import { NavigationHistoryService } from '../../../services/navigation-history.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent {
  constructor(private navHistory: NavigationHistoryService) {}

  volver(): void {
    // Usamos el servicio de historial para volver atrás
    this.navHistory.back('/home').then(success => {
      if (!success) {
      }
    });
  }
}
