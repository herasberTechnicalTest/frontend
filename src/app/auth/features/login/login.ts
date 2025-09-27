import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../core/services/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports:[FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  email=''; password='';

  submit(){
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/professionals']),
      error: (e) => alert(e?.error?.message || 'Login failed')
    });

  }
}
