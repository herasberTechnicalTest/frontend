import { Component } from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {NavbarComponent} from './shared/components/navbar/navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports:[RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})


export class App {
  year = new Date().getFullYear();
}
