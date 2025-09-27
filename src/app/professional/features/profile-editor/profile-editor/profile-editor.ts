import {Component, inject, OnInit, signal} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {ProfessionalService} from '../../../core/services/professional-service';
import {ProfessionalDTO, UpdateProfessionalPayload} from '../../../shared/professionalDTO';
import {ActivatedRoute, Router} from '@angular/router';
import {NgFor, NgIf} from '@angular/common';
import {firstValueFrom} from 'rxjs';


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

  // ---------- utils ----------
  private isHttpUrl = (s: string | null | undefined) =>
    typeof s === 'string' && /^https?:\/\//i.test(s.trim());

  private normalizeCountry(s: string): string {
    const v = (s || '').trim();
    if (!v) return '';
    return v.toLowerCase() === 'perú' ? 'Peru' : v;
  }

  private recomputeMapsUrl(countryName: string, cityName: string, districtName: string) {
    const q = encodeURIComponent([districtName, cityName, countryName].filter(Boolean).join(', '));
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }

  // ---------- lifecycle ----------
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

  // ---------- imagen (compresión para preview) ----------
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
    if (f.size > 500 * 1024) { alert('Imagen muy grande (máx 500 KB)'); return; }
    this.uploadingAvatar = true;
    this.avatarPreview = URL.createObjectURL(f);
    try {
      const b64 = await this.compressToDataURL(f);
      const approxBytes = (b64.length - b64.indexOf(',') - 1) * 3 / 4;
      if (approxBytes > 350 * 1024) { alert('Tras comprimir sigue grande (~350 KB máx)'); this.avatarPreview = null; return; }
      this.model.photoUrl = b64; // luego se sube (o se usa original si falla)
    } finally {
      this.uploadingAvatar = false;
    }
  }

  async onGalleryChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (!files.length) return;
    if (files.find(f => f.size > 500 * 1024)) { alert('Una imagen excede 500 KB'); return; }
    this.uploadingGallery = true;
    this.galleryPreviews.push(...files.map(f => URL.createObjectURL(f)));
    try {
      const list = await Promise.all(files.map(f => this.compressToDataURL(f)));
      const filtered = list.filter(b64 => {
        const approxBytes = (b64.length - b64.indexOf(',') - 1) * 3 / 4;
        return approxBytes <= 350 * 1024;
      });
      this.model.gallery = [...(this.model.gallery || []), ...filtered];
    } finally {
      this.uploadingGallery = false;
    }
  }

  removeGalleryItem(i: number) {
    this.galleryPreviews.splice(i, 1);
    this.model.gallery.splice(i, 1);
  }

  // ---------- upload seguro (convierte data: -> URL) ----------
  private dataURLtoFile(dataURL: string, filename = 'image.jpg'): File {
    const [meta, data] = dataURL.split(',');
    const mimeMatch = meta.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const binary = atob(data);
    const u8 = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) u8[i] = binary.charCodeAt(i);
    return new File([u8], filename, { type: mime });
  }

  private async tryUploadDataUrl(dataUrl: string, name: string): Promise<string> {
    if (!dataUrl?.startsWith('data:')) return dataUrl; // ya es URL
    try {
      const file = this.dataURLtoFile(dataUrl, name);
      const res = await firstValueFrom(this.api.upload(file));
      return res?.url || dataUrl;
    } catch (e) {
      console.warn('Upload falló; uso valor existente', e);
      return dataUrl; // no rompemos
    }
  }

  private async ensureUrlsForImages(): Promise<{ photoUrl: string; gallery: string[] }> {
    // Foto principal
    let photo: string;
    if (this.isHttpUrl(this.model.photoUrl)) {
      photo = this.model.photoUrl!;
    } else if (this.model.photoUrl?.startsWith('data:')) {
      const url = await this.tryUploadDataUrl(this.model.photoUrl, 'avatar.jpg');
      photo = this.isHttpUrl(url) ? url : (this.original.photoUrl || '');
    } else {
      photo = this.original.photoUrl || '';
    }

    // Galería: subimos sólo los data:, mantenemos http(s), ignoramos lo inválido
    const current = Array.isArray(this.model.gallery) ? this.model.gallery : [];
    const processed = await Promise.all(
      current.map((item, i) =>
        item?.startsWith('data:')
          ? this.tryUploadDataUrl(item, `gallery_${i}.jpg`)
          : Promise.resolve(item)
      )
    );
    const gallery = processed.filter(u => this.isHttpUrl(u));

    return { photoUrl: photo, gallery: gallery.length ? gallery : (this.original.gallery || []) };
  }

  // ---------- payload EXACTO (incluye id) ----------
  private async buildPutBodyIncludingIdAndImages(): Promise<{
    id: number;
    fullName: string; email: string; password?: string; phone: string;
    servicesDescription: string; photoUrl: string; gallery: string[];
    rate: number; currency: string; countryName: string; cityName: string;
    districtName: string; mapsUrl: string;
  }> {
    const o = this.original;

    const { photoUrl, gallery } = await this.ensureUrlsForImages();

    const fullName = (this.model.fullName || o.fullName || '').trim();
    const servicesDescription = (this.model.servicesDescription || o.servicesDescription || '').trim();
    const phone = (this.model.phone || o.phone || '').trim();

    const email = (o.email || '').trim().toLowerCase();

    const countryName = this.normalizeCountry(this.model.countryName || o.countryName || 'Peru');
    const cityName = (this.model.cityName || o.cityName || '').trim();
    const districtName = (this.model.districtName || o.districtName || '').trim();
    const mapsUrl = this.recomputeMapsUrl(countryName, cityName, districtName);

    const rate = Number.isFinite(Number(this.model.rate)) ? Number(this.model.rate) : Number(o.rate || 0);
    const currency = ((this.model.currency || o.currency || 'PEN') + '').toUpperCase().slice(0, 3);

    const body: any = {
      id: this.id,
      fullName,
      email,
      phone,
      servicesDescription,
      photoUrl: String(photoUrl || ''),
      gallery: Array.isArray(gallery) ? gallery : [],
      rate,
      currency,
      countryName,
      cityName,
      districtName,
      mapsUrl
    };

    if (this.password && this.password.trim().length >= 6) {
      body.password = this.password.trim();
    }

    return body;
  }

  async submit() {
    if (this.uploadingAvatar || this.uploadingGallery) return;

    if (!this.model.fullName?.trim() || !this.model.servicesDescription?.trim()) {
      alert('Completa nombre y descripción de servicios.');
      return;
    }

    try {
      const payload = await this.buildPutBodyIncludingIdAndImages();
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
    } catch (err) {
      console.error('No se pudo preparar el payload', err);
      alert('No se pudo preparar los datos para enviar.');
    }
  }
}
