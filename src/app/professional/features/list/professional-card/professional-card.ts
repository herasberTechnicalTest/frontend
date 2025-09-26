import {Component, Input, input} from '@angular/core';
import {CommonModule} from '@angular/common';
import { RouterLink } from '@angular/router';
import {ProfessionalDTO} from '../../../shared/professionalDTO';

@Component({
  selector: 'app-professional-card',
  standalone: true,
  imports:[CommonModule, RouterLink],
  templateUrl: './professional-card.html',
  styleUrl: './professional-card.css'
})
export class ProfessionalCard {
  @Input({required: true}) professionals!: ProfessionalDTO;

  private placeholder = 'https://via.placeholder.com/600x360?text=Foto';

  displayPhoto(u?: string | null): string {
    if (!u) return this.placeholder;
    const isData = u.startsWith('data:image/');
    const isHttp = /^https?:\/\//i.test(u);
    return (isData || isHttp) ? u : this.placeholder;
  }

}
