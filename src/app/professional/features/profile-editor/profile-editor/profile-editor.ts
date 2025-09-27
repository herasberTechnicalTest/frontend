import {Component, inject, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {ProfessionalService} from '../../../core/services/professional-service';
import {ProfessionalDTO} from '../../../shared/professionalDTO';
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

  // Cambiar foto de perfil
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
      this.model.photoUrl = b64;
    } finally {
      this.uploadingAvatar = false;
    }
  }

  // Cambiar fotos de la galería
  async onGalleryChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (!files.length) return;
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

  // Eliminar foto de la galería
  removeGalleryItem(i: number) {
    const removedImage = this.galleryPreviews.splice(i, 1)[0]; // Eliminar imagen de la vista previa
    this.model.gallery.splice(i, 1); // Eliminar imagen del modelo

    // Llamada DELETE a la API para eliminar la imagen de la galería
    this.api.deleteImageFromGallery(this.id, removedImage).subscribe(
      () => {
        console.log('Imagen eliminada exitosamente.');
      },
      (error) => {
        console.error('Error al eliminar la imagen', error);
        alert('Error al eliminar la imagen');
      }
    );
  }
// Convierte el archivo en una cadena Base64
  private fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result)); // Convierte el resultado en string
      r.onerror = reject;  // Si hay un error, lo rechazamos
      r.readAsDataURL(file);  // Lee el archivo como Data URL
    });
  }

// Comprime la imagen y luego la convierte en Base64
  private async compressToDataURL(file: File, maxSide = 900, quality = 0.68): Promise<string> {
    const dataURL = await this.fileToDataURL(file);  // Convertir el archivo a Base64
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);  // Espera que la imagen cargue
      i.onerror = rej;  // Si hay un error, lo rechazamos
      i.src = dataURL;  // Asignamos la imagen en formato Base64
    });

    // Escala la imagen para que se ajuste a los límites máximos
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);  // Calcula el nuevo ancho
    const h = Math.round(img.height * scale);  // Calcula la nueva altura

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, w, h);  // Dibuja la imagen escalada en un canvas

    return canvas.toDataURL('image/jpeg', quality);  // Devuelve la imagen comprimida como Base64
  }

  // Enviar los cambios (Perfil)
  submit() {
    if (this.uploadingAvatar || this.uploadingGallery) return;

    this.api.update(this.id, this.model).subscribe({
      next: (dto) => {
        alert('Perfil actualizado');
        this.original = { ...this.original, ...dto };
        this.model = { ...dto };
        this.avatarPreview = this.model.photoUrl || null;
        this.galleryPreviews = [...(this.model.gallery || [])];
      },
      error: (error) => {
        console.error('Error al actualizar el perfil', error);
        alert('Error al actualizar el perfil');
      }

    });

  }
}
