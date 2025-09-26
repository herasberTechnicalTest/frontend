import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {ProfessionalService} from '../../../professional/core/services/professional-service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports:[FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  private api = inject(ProfessionalService);
  private router = inject(Router);

  model: any = {
    fullName: '', email: '', password: '',
    phone: '', servicesDescription: '',
    photoUrl: '', gallery: [],
    rate: 0, currency: 'PEN',
    countryName: 'Perú', cityName: '', districtName: '',
    mapsUrl: '', whatsappLink: ''
  };

  submit(){
    this.api.create(this.model).subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: e => alert(e.error?.message || 'Error al registrar')
    });
  }
}
