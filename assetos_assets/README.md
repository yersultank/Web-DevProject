# AssetOS — Illustrations & Animations

All assets use the AssetOS accent color **#7C3AED**. Free for commercial use.

## Folder layout

```
assetos_assets/
├── illustrations/        # Static SVGs (unDraw)
│   ├── hero.svg          # Dashboard / data viz scene
│   ├── login.svg         # Sign-in scene
│   ├── empty.svg         # No data / empty state
│   ├── server-cluster.svg   # Server racks + network — asset inventory
│   ├── server-status.svg    # Server monitoring — asset health
│   └── secure-server.svg    # Shield + servers — security/compliance
└── animations/           # Lottie JSON (LottieFiles)
    ├── loading_spinner.json
    ├── success_check.json
    ├── empty_state.json
    ├── error_404.json
    └── data_sync.json
```

## Target location in your project

```bash
# From your repo root:
mkdir -p frontend/src/assets/images
mkdir -p frontend/src/assets/animations
cp assetos_assets/illustrations/*.svg frontend/src/assets/images/
cp assetos_assets/animations/*.json    frontend/src/assets/animations/
```

## Angular Lottie integration (ngx-lottie)

Install:

```bash
npm install lottie-web ngx-lottie
```

Register in `app.config.ts` (standalone):

```ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';

export const appConfig: ApplicationConfig = {
  providers: [
    provideLottieOptions({ player: () => player }),
  ],
};
```

Use in a component:

```ts
import { Component } from '@angular/core';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [LottieComponent],
  template: `<ng-lottie [options]="options" width="120px" height="120px" />`,
})
export class LoadingComponent {
  options: AnimationOptions = {
    path: '/assets/animations/loading_spinner.json',
    loop: true,
    autoplay: true,
  };
}
```

## Where to use each

| Asset | Suggested screen |
|---|---|
| hero.svg | Landing / marketing hero |
| login.svg | Login & register page |
| empty.svg (or empty_state.json) | "No assets found" table state |
| server-cluster.svg | Inventory / all assets page |
| server-status.svg | Asset health / monitoring page |
| secure-server.svg | Access control / audit log page |
| loading_spinner.json | Global route/data loading |
| success_check.json | Toast after creating / updating an asset |
| error_404.json | 404 / error boundary |
| data_sync.json | "Syncing…" banner when fetching from backend |

## Tinting Lottie animations to purple

Lottie colors are baked in. To recolor a spinner to #7C3AED, open the JSON, find `"c": {"k": [r,g,b,a]}` entries, and swap them with purple (R=0.486, G=0.227, B=0.929). Or apply a CSS filter:

```css
.lottie-purple { filter: hue-rotate(-20deg) saturate(1.4); }
```

## Licenses

- **unDraw** — MIT-style open license, no attribution required.
- **LottieFiles** — Lottie Simple License, free for commercial and personal use.
