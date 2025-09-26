import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {tokenInterceptor} from './app/auth/core/interceptors/token_interceptor';
import {provideRouter} from '@angular/router';
import {routes} from './app/app.routes';

bootstrapApplication(App,
    {
      providers: [
        provideHttpClient(withInterceptors([tokenInterceptor])),
        provideRouter(routes)
      ]
    });
