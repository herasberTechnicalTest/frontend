import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {ProfessionalService} from '../../../core/services/professional-service';
import {ProfessionalDTO} from '../../../shared/professionalDTO';


@Component({
  selector: 'app-profile-editor',
  standalone: true,
  imports:[FormsModule],
  templateUrl: './profile-editor.html',
  styleUrl: './profile-editor.css'
})
export class ProfileEditor {
  private api = inject(ProfessionalService);
  me = signal<ProfessionalDTO | null>(null);


  readonly myId = 1;

  ngOnInit(){
    this.api.getById(this.myId).subscribe(p => this.me.set(p));
  }

  addGallery(url: string){
    const m = this.me()!; m.gallery = [...(m.gallery || []), url]; this.me.set({...m});
  }

  save(){
    const m = this.me()!;
    this.api.update(this.myId, m).subscribe({
      next: () => alert('Perfil actualizado'),
      error: e => alert(e.error?.message || 'Error al guardar')
    });
  }
}
