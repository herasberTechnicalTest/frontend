import { Component, input, computed } from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.html',
  styleUrl: './map.css'
})
export class MapComponent {
  mapsUrl = input<string | undefined>();
  query   = input<string>('');

  constructor(private sanitizer: DomSanitizer) {}

  private toEmbedUrl(rawUrl?: string, fallbackQuery?: string): string {
    if (!rawUrl && !fallbackQuery) {
      return 'about:blank';
    }
    try {
      if (rawUrl) {
        const u = new URL(rawUrl);
        const qParam = u.searchParams.get('q') || u.searchParams.get('query');
        if (qParam) {
          return `https://www.google.com/maps?q=${encodeURIComponent(qParam)}&z=14&output=embed`;
        }
        if (u.searchParams.get('output') === 'embed') {
          return rawUrl;
        }
      }
    } catch {
    }
    const q = (fallbackQuery || '').trim();
    return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=14&output=embed`;
  }

  safeUrl = computed<SafeResourceUrl>(() => {
    const raw = this.toEmbedUrl(this.mapsUrl(), this.query());
    return this.sanitizer.bypassSecurityTrustResourceUrl(raw);
  });

  viewUrl = computed<string>(() => {
    if (this.mapsUrl()) return this.mapsUrl()!;
    const q = (this.query() || '').trim();
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  });
}
