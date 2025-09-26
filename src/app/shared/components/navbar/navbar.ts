import {Component, computed, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
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
  private auth = inject(AuthService);

  isLoggedIn = computed(() => this.auth.loggedIn());

  logout() { this.auth.logout(); }
}
