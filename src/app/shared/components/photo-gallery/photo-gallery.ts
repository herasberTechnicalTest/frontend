import { Component, input } from '@angular/core';
import {NgFor} from '@angular/common';

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [NgFor],
  templateUrl: './photo-gallery.html',
  styleUrl: './photo-gallery.css'
})
export class PhotoGallery {
  images = input<string[]>([]);
}
