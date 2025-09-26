import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';

import {ProfessionalService} from '../../../core/services/professional-service';
import {ProfessionalDTO} from '../../../shared/professionalDTO';
import {PhotoGallery} from '../../../../shared/components/photo-gallery/photo-gallery';
import {MapComponent} from '../../../../shared/components/map/map';

@Component({
  selector: 'app-professional-detail',
  standalone: true,
  imports:[NgIf, PhotoGallery, MapComponent],
  templateUrl: './professional-detail.html',
  styleUrl: './professional-detail.css'
})
export class ProfessionalDetail {
  private route = inject(ActivatedRoute);
  private api = inject(ProfessionalService);

  pro = signal<ProfessionalDTO | null>(null);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getById(id).subscribe(p => this.pro.set(p));
  }
}
