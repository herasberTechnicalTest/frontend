import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {ProfessionalService} from '../../../core/services/professional-service';
import {ProfessionalDTO} from '../../../shared/professionalDTO';
import {MapComponent} from '../../../../shared/components/map/map';
import {NgFor, NgIf} from '@angular/common';

@Component({
  selector: 'app-professional-detail',
  standalone: true,
  imports:[NgIf, NgFor, MapComponent],
  templateUrl: './professional-detail.html',
  styleUrl: './professional-detail.css'
})
export class ProfessionalDetail {private route = inject(ActivatedRoute);
  private api = inject(ProfessionalService);

  professional?: ProfessionalDTO;
  loading = true;

  private placeholder = 'https://via.placeholder.com/800x500?text=Foto';

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getById(id).subscribe({
      next: (p) => { this.professional = p; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  displayPhoto(u?: string | null): string {
    if (!u) return this.placeholder;
    const isData = u.startsWith('data:image/');
    const isHttp = /^https?:\/\//i.test(u);
    return (isData || isHttp) ? u : this.placeholder;
  }

  gallerySafe(list?: string[] | null): string[] {
    if (!Array.isArray(list)) return [];
    return list.filter(s =>
      typeof s === 'string' &&
      (s.startsWith('data:image/') || /^https?:\/\//i.test(s))
    );
  }
}

