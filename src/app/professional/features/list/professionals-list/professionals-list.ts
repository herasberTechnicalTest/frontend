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
  imports:[CommonModule, FormsModule, ProfessionalCard, PriceFilter],
  templateUrl: './professionals-list.html',
  styleUrl: './professionals-list.css'
})
export class ProfessionalsList {
  private api = inject(ProfessionalService);
  items = signal<ProfessionalDTO[]>([]);
  loading = signal(false);

  q=''; cityName=''; districtName=''; minRate?:number; maxRate?:number;

  ngOnInit(){ this.load(); }

  onPrice(e:{min?:number;max?:number}){ this.minRate=e.min; this.maxRate=e.max; this.load(); }

  load(){
    this.loading.set(true);
    this.api.list({ q:this.q, cityName:this.cityName, districtName:this.districtName, minRate:this.minRate, maxRate:this.maxRate })
      .subscribe({
        next: arr => { console.log('pros:', arr); this.items.set(arr); },
        error: err => { console.error('GET /professionals', err); this.items.set([]); },
        complete: () => this.loading.set(false)
      });
  }
}
