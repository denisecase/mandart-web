# mandart-web

Web interface for MandArt

App: <https://denisecase.github.io/mandart-web/>

Repo: <https://github.com/denisecase/mandart-web>

## Serve Locally With Python

Use Python HTTP server on Windows or Linux/Mac.

```zsh
py -m http.server 8000
python3 -m http.server 8000
```

Open browser to [http://localhost:8000](http://localhost:8000)

CRTL c to terminate the server

## Online

[https://denisecase.github.io/mandart-web/](https://denisecase.github.io/mandart-web/)

## Purpose

Finding interesting locations in the Mandelbrot set can be time-consuming. 
For that, there's the MandArt SwiftUI app. 

This app allows you to open an existing MandArt drawing and recolor it (a relatively quick calculation).
The app calculate the grid of fractional iterations (using Rust for speed) and then applies your new coloring to the existing grid.

Specifically:

The web interface that opens a .mandart file 4 ways (from file, url, catalog with images, and dropdown list. 
It stores the original file, calcs a grid and colors it. 
The web interface allows users to edit color inputs and recolor the grid. 

The shape inputs remain the same (same grid). 
Users can save the recolored inputs as .mandart, save the grid as csv, save a bitmap, or save png image. 

The web app uses a wasm rust engine for the calculations. 

## Services Layer

- MandArtService.js - Manages MandArt state, processes, updates, and computes grids.
- FileService.js - Handles file I/O (reading/writing .mandart, .png, .csv).
- MandArtCatalogService.js - Loads and caches the catalog of available MandArt files.
- services/loaders/ (FileLoader, UrlLoader, CatalogLoader, index.js) - Abstracts loading from different sources (file, URL, catalog).
- MandArtServiceInputUtils.js - Extracts and sanitizes shape and color inputs.
- MandArtServiceValidatorUtils.js - Ensures valid MandArt data, prevents corruption.
