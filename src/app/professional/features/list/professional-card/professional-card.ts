import { Component, input } from '@angular/core';
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
  pro = input.required<ProfessionalDTO>();
}
