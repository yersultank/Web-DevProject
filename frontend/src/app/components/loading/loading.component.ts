import { Component } from '@angular/core';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [LottieComponent],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css',
})
export class LoadingComponent {
  loadingOptions: AnimationOptions = {
    path: 'assets/animations/loading_spinner.json',
  };
}
