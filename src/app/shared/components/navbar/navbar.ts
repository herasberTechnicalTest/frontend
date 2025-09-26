import {Component, computed, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {NgIf} from '@angular/common';
import {AuthService} from '../../../auth/core/services/auth-service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, NgIf],
  templateUrl: './navbar.html',
  standalone: true,
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  auth = inject(AuthService); // usar directamente en el template

  logout() { this.auth.logout(); }
}
