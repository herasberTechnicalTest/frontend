import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-price-filter',
  standalone: true,
  imports:[FormsModule],
  templateUrl: './price-filter.html',
  styleUrl: './price-filter.css'
})
export class PriceFilter{
  min?: number; max?: number;
  @Output() change = new EventEmitter<{min?:number;max?:number}>();
  apply(){ this.change.emit({min: this.min, max: this.max}); }
}
