import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {AuthService} from '../../core/services/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports:[FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  email=''; password='';

  submit(){
    this.auth.login(this.email, this.password).subscribe({
      next: r => { this.auth.setToken(r.token); this.router.navigateByUrl('/me/profile'); },
      error: e => alert(e.error?.message || 'Error de autenticación')
    });
  }
}
