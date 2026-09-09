ReportFlow Pro PWA package

Upload these files/folders to the ROOT of the same site/repository that currently hosts ReportFlow:

index.html
manifest.webmanifest
service-worker.js
icons/
  icon-192.png
  icon-512.png
  icon-maskable-512.png

After deployment:
1. Open the live HTTPS ReportFlow URL in Chrome on Android.
2. Refresh once.
3. Open Chrome menu.
4. Choose Install app / Add to Home screen > Install.

The app uses relative paths so it works on both a root domain and a GitHub Pages project subfolder.
