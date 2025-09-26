import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {ProfessionalCard} from '../professional-card/professional-card';
import {PriceFilter} from '../../../../shared/components/price-filter/price-filter';
import {ProfessionalService} from '../../../core/services/professional-service';
import {ProfessionalDTO} from '../../../shared/professionalDTO';
import {CommonModule} from '@angular/common';



@Component({
  selector: 'app-professionals-list',
  standalone: true,
  imports:[CommonModule, FormsModule, ProfessionalCard],
  templateUrl: './professionals-list.html',
  styleUrl: './professionals-list.css'
})
export class ProfessionalsList {
  private api = inject(ProfessionalService);

  items = signal<ProfessionalDTO[]>([]);
  loading = signal(false);


  q = '';
  cityName = '';
  districtName = '';
  minRate: number | null = null;
  maxRate: number | null = null;

  ngOnInit(){ this.applyFilters(); }

  trackById = (_: number, p: ProfessionalDTO) => p.id;

  applyFilters() {
    const city     = this.cityName.trim() || undefined;
    const district = this.districtName.trim() || undefined;

    const rate = (this.minRate == null && this.maxRate != null) ? this.maxRate : undefined;

    this.loading.set(true);
    this.api.list({ city, district, rate }).subscribe({
      next: arr => {

        const q = this.q.trim().toLowerCase();
        const min = this.minRate ?? Number.NEGATIVE_INFINITY;
        const max = this.maxRate ?? Number.POSITIVE_INFINITY;

        const filtered = arr.filter(p => {
          const okQ =
            !q ||
            p.fullName?.toLowerCase().includes(q) ||
            p.servicesDescription?.toLowerCase().includes(q) ||
            p.cityName?.toLowerCase().includes(q) ||
            p.districtName?.toLowerCase().includes(q);

          const r = Number(p.rate ?? 0);
          const okRange = r >= min && r <= max;

          return okQ && okRange;
        });

        this.items.set(filtered);
      },
      error: err => { console.error(err);  },
      complete: () => this.loading.set(false)
    });
  }

  clearFilters(){
    this.q=''; this.cityName=''; this.districtName='';
    this.minRate=null; this.maxRate=null;
    this.applyFilters();
  }
}
