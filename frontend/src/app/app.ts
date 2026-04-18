import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
/**
 * Root shell component that hosts the application router outlet.
 */
export class App {
  protected readonly title = signal('frontend');
}
