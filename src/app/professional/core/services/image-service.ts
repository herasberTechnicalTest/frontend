// src/app/professional/core/services/image-service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import ImageKit from 'imagekit-javascript';

type IKAuth = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
};

@Injectable({ providedIn: 'root' })
export class ImageService {
  private http = inject(HttpClient);


  private async getAuth(): Promise<IKAuth> {
    return await firstValueFrom(this.http.get<IKAuth>('/api/imagekit/auth'));

  }


  async upload(file: File, opts?: { folder?: string; fileName?: string }) {
    const auth = await this.getAuth();

    const ik = new ImageKit({
      publicKey: auth.publicKey,
      urlEndpoint: auth.urlEndpoint

    } as any);

    const result = await ik.upload({
      file,
      fileName: opts?.fileName || file.name,
      folder: opts?.folder || '/professionals',
      useUniqueFileName: true,
      token: auth.token,
      expire: auth.expire,
      signature: auth.signature
    } as any);

    return {
      url: (result as any).url as string,
      thumbnailUrl: (result as any).thumbnailUrl as string | undefined
    };
  }
}
