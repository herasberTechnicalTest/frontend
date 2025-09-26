import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {ProfessionalService} from '../../../professional/core/services/professional-service';
import {NgFor, NgIf} from '@angular/common';
import {CreateProfessionalPayload} from '../../../professional/shared/professionalDTO';



@Component({
  selector: 'app-register',
  standalone: true,
  imports:[NgFor, NgIf, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent  {
  private api = inject(ProfessionalService);
  private router = inject(Router);


  model: CreateProfessionalPayload = {
    fullName: '',
    email: '',
    password: '',
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


  uploadingAvatar = false;
  uploadingGallery = false;
  avatarPreview: string | null = null;
  galleryPreviews: string[] = [];

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
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert('Imagen muy grande (máx 500 KB antes de comprimir)');
      return;
    }

    this.uploadingAvatar = true;
    this.avatarPreview = URL.createObjectURL(file);

    try {

      const b64 = await this.compressToDataURL(file);


      const approxBytes = (b64.length - b64.indexOf(",") - 1) * 3 / 4;
      if (approxBytes > 350 * 1024) {
        alert('Tras comprimir, la imagen sigue grande (máx ~350 KB)');
        this.avatarPreview = null;
        return;
      }

      this.model.photoUrl = b64;
    } catch {
      alert('No se pudo procesar la foto principal');
      this.avatarPreview = null;
    } finally {
      this.uploadingAvatar = false;
    }
  }

  async onGalleryChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (!files.length) return;

    const tooBig = files.find(f => f.size > 500 * 1024);
    if (tooBig) {
      alert(`Una imagen de la galería excede 500 KB: ${tooBig.name}`);
      return;
    }

    this.uploadingGallery = true;
    this.galleryPreviews.push(...files.map(f => URL.createObjectURL(f)));

    try {

      const list = await Promise.all(files.map(f => this.compressToDataURL(f)));


      const filtered: string[] = [];
      list.forEach((b64, idx) => {
        const approxBytes = (b64.length - b64.indexOf(",") - 1) * 3 / 4;
        if (approxBytes <= 350 * 1024) {
          filtered.push(b64);
        } else {
          alert(`Una imagen sigue grande tras comprimir: ${files[idx].name}`);
          const previewIndex = this.galleryPreviews.findIndex(p => p.includes(files[idx].name));
        }
      });

      this.model.gallery.push(...filtered);
    } catch {
      alert('No se pudo procesar una o más fotos de la galería');
    } finally {
      this.uploadingGallery = false;
    }
  }


  removeGalleryPreview(i: number) {
    this.galleryPreviews.splice(i, 1);
    this.model.gallery.splice(i, 1);
  }

  submit() {
    if (this.uploadingAvatar || this.uploadingGallery) return;

    if (!this.model.fullName?.trim() ||
      !this.model.email?.trim() ||
      !this.model.password?.trim() ||
      !this.model.servicesDescription?.trim()) {
      alert('Completa nombre, email, contraseña y descripción de servicios.');
      return;
    }

    const payload: CreateProfessionalPayload = {
      ...this.model,
      email: this.model.email.trim().toLowerCase(),
      fullName: this.model.fullName.trim(),
      servicesDescription: this.model.servicesDescription.trim(),
      cityName: (this.model.cityName || '').trim(),
      districtName: (this.model.districtName || '').trim(),
      // Aseguramos que photoUrl sea string (no null/undefined)
      photoUrl: String(this.model.photoUrl || ''),

      gallery: Array.isArray(this.model.gallery)
        ? this.model.gallery.filter((s: string) => typeof s === 'string' && s.length > 10)
        : []
    };

    console.log('POST /professional payload', payload);

    this.api.create(payload).subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: (e) => {
        const status = e?.status;
        const msg = e?.error?.message || e?.error || e?.message || 'Error';
        alert(`${status ? status + ' – ' : ''}${msg}`);
        console.error('Create professional failed:', e);
      }
    });
  }
}
