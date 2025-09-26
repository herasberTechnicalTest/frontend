import {Component, inject, OnInit, signal} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {ProfessionalService} from '../../../core/services/professional-service';
import {ProfessionalDTO, UpdateProfessionalPayload} from '../../../shared/professionalDTO';
import {ActivatedRoute, Router} from '@angular/router';
import {NgFor, NgIf} from '@angular/common';


@Component({
  selector: 'app-profile-editor',
  standalone: true,
  imports:[FormsModule, NgFor, NgIf],
  templateUrl: './profile-editor.html',
  styleUrl: './profile-editor.css'
})
export class ProfileEditor implements OnInit {
  private api = inject(ProfessionalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id!: number;

  model: ProfessionalDTO = {
    id: 0,
    fullName: '',
    email: '',
    phone: '',
    servicesDescription: '',
    photoUrl: '',
    gallery: [],
    rate: 0,
    currency: 'PEN',
    countryName: 'Perú',
    cityName: '',
    districtName: '',
    mapsUrl: '',
    whatsappLink: ''
  };

  private original!: ProfessionalDTO;

  uploadingAvatar = false;
  uploadingGallery = false;
  avatarPreview: string | null = null;
  galleryPreviews: string[] = [];
  password = '';

  ngOnInit() {
    const idNum = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(idNum) || idNum <= 0) {
      alert('ID inválido');
      this.router.navigateByUrl('/professionals');
      return;
    }
    this.id = idNum;
    this.load();
  }

  private load() {
    this.api.getById(this.id).subscribe({
      next: dto => {
        this.original = { ...dto };
        this.model = { ...dto };
        this.avatarPreview = this.model.photoUrl || null;
        this.galleryPreviews = [...(this.model.gallery || [])];
      },
      error: () => {
        alert('No se pudo cargar el perfil');
        this.router.navigateByUrl('/professionals');
      }
    });
  }

  // ======== utilidades sólo para preview local (NO se envían en el PUT) ========
  private fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }
  private async compressToDataURL(file: File, maxSide = 900, quality = 0.68): Promise<string> {
    const dataURL = await this.fileToDataURL(file);
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = dataURL;
    });
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', quality);
  }
  async onAvatarChange(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    this.uploadingAvatar = true;
    this.avatarPreview = URL.createObjectURL(f);
    try { this.model.photoUrl = await this.compressToDataURL(f); }
    finally { this.uploadingAvatar = false; }
  }
  async onGalleryChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (!files.length) return;
    this.uploadingGallery = true;
    this.galleryPreviews.push(...files.map(f => URL.createObjectURL(f)));
    try {
      const list = await Promise.all(files.map(f => this.compressToDataURL(f)));
      this.model.gallery = [...(this.model.gallery || []), ...list];
    } finally { this.uploadingGallery = false; }
  }
  removeGalleryItem(i: number) {
    this.galleryPreviews.splice(i, 1);
    this.model.gallery.splice(i, 1);
  }

  // ======== helpers ========
  private normalizeCountry(s: string): string {
    const v = (s || '').trim();
    if (!v) return '';
    return v.toLowerCase() === 'perú' ? 'Peru' : v;
  }
  private recomputeDerivedFields(countryName: string, cityName: string, districtName: string) {
    const q = encodeURIComponent([districtName, cityName, countryName].filter(Boolean).join(', '));
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }

  /**
   * Body EXACTO del esquema de tu backend, incluyendo `id`.
   * - Toma imágenes y email del ORIGINAL (válidos para el server).
   * - Actualiza sólo textos y números editados.
   */
  private buildPutBodyIncludingId(): {
    id: number;
    fullName: string; email: string; password?: string; phone: string;
    servicesDescription: string; photoUrl: string; gallery: string[];
    rate: number; currency: string; countryName: string; cityName: string;
    districtName: string; mapsUrl: string;
  } {
    const o = this.original;

    const fullName = (this.model.fullName || o.fullName || '').trim();
    const servicesDescription = (this.model.servicesDescription || o.servicesDescription || '').trim();
    const phone = (this.model.phone || o.phone || '').trim();

    // no tocamos email (lo dejamos como lo tiene el servidor)
    const email = (o.email || '').trim().toLowerCase();

    // normalizaciones
    const countryName = this.normalizeCountry(this.model.countryName || o.countryName || 'Peru');
    const cityName = (this.model.cityName || o.cityName || '').trim();
    const districtName = (this.model.districtName || o.districtName || '').trim();
    const mapsUrl = this.recomputeDerivedFields(countryName, cityName, districtName);

    // imágenes: mandamos EXACTAMENTE lo que ya acepta el backend (original)
    const photoUrl = String(o.photoUrl || '');
    const gallery = Array.isArray(o.gallery) ? o.gallery : [];

    // moneda/monto
    const rate = Number.isFinite(Number(this.model.rate)) ? Number(this.model.rate) : Number(o.rate || 0);
    const currency = ((this.model.currency || o.currency || 'PEN') + '').toUpperCase().slice(0, 3);

    const body: any = {
      id: this.id,           // 👈 requerido por tu backend
      fullName,
      email,
      password: undefined,   // sólo si la cambias abajo
      phone,
      servicesDescription,
      photoUrl,
      gallery,
      rate,
      currency,
      countryName,
      cityName,
      districtName,
      mapsUrl
    };

    if (this.password && this.password.trim().length >= 6) {
      body.password = this.password.trim();
    } else {
      delete body.password;
    }

    return body;
  }

  submit() {
    if (this.uploadingAvatar || this.uploadingGallery) return;

    if (!this.model.fullName?.trim() || !this.model.servicesDescription?.trim()) {
      alert('Completa nombre y descripción de servicios.');
      return;
    }

    const payload = this.buildPutBodyIncludingId();
    console.log('PUT /professionals/:id payload ->', payload);

    this.api.update(this.id, payload).subscribe({
      next: (dto) => {
        alert('Perfil actualizado');
        this.original = { ...this.original, ...dto };
        this.model = { ...dto };
        this.avatarPreview = this.model.photoUrl || null;
        this.galleryPreviews = [...(this.model.gallery || [])];
      },
      error: (e) => {
        const raw = e?.error;
        const details =
          typeof raw === 'string' ? raw :
            raw?.message || raw?.error || e?.message || 'Error';
        alert(`${e?.status ?? ''} – ${details}`);
        console.error('Update professional failed:', e, raw);
      }
    });
  }
}
