// art-image.js
// Based on ArtImage.swift, this file contains the logic for generating Mandelbrot art images.

class ArtImageShapeInputs {
  constructor(imageHeight, imageWidth, iterationsMax, scale, xCenter, yCenter, theta, dFIterMin, rSqLimit) {
      this.imageHeight = imageHeight;
      this.imageWidth = imageWidth;
      this.iterationsMax = iterationsMax;
      this.scale = scale;
      this.xCenter = xCenter;
      this.yCenter = yCenter;
      this.theta = theta;
      this.dFIterMin = dFIterMin;
      this.rSqLimit = rSqLimit;
  }
}

class ArtImageColorInputs {
  constructor(nBlocks, nColors, spacingColorFar, spacingColorNear, yY_input, mandColor) {
      this.nBlocks = nBlocks;
      this.nColors = nColors;
      this.spacingColorFar = spacingColorFar;
      this.spacingColorNear = spacingColorNear;
      this.yY_input = yY_input;
      this.mandColor = mandColor;
  }
}

class ArtImagePowerInputs {
  constructor(mandPowerReal) {
      this.mandPowerReal = mandPowerReal;
  }
}

class ArtImage {
  constructor(picdef) {
      this.shapeInputs = new ArtImageShapeInputs(
          picdef.imageHeight, picdef.imageWidth, picdef.iterationsMax, picdef.scale,
          picdef.xCenter, picdef.yCenter, -picdef.theta, picdef.dFIterMin, picdef.rSqLimit
      );

      this.colorInputs = new ArtImageColorInputs(
          picdef.nBlocks, picdef.hues.length, picdef.spacingColorFar, picdef.spacingColorNear,
          picdef.yY, picdef.mandColor
      );

      this.powerInputs = new ArtImagePowerInputs(picdef.mandPowerReal);
  }

  isMandArt() {
      return this.powerInputs.mandPowerReal === 2;
  }

  isMandArt3() {
      return this.powerInputs.mandPowerReal === 3;
  }

  complexPow(baseX, baseY, powerReal) {
      if (this.isMandArt()) {
          return [(baseX * baseX - baseY * baseY), (2.0 * baseX * baseY)];
      } else if (this.isMandArt3()) {
          let xSquared = baseX * baseX;
          let ySquared = baseY * baseY;
          return [(xSquared - 3.0 * ySquared) * baseX, (3.0 * xSquared - ySquared) * baseY];
      } else {
          let r = Math.sqrt(baseX * baseX + baseY * baseY);
          let theta = Math.atan2(baseY, baseX);
          let newR = Math.pow(r, powerReal);
          let newTheta = powerReal * theta;
          return [newR * Math.cos(newTheta), newR * Math.sin(newTheta)];
      }
  }

  generateGrid() {
      let { imageWidth, imageHeight, iterationsMax, scale, xCenter, yCenter, theta, rSqLimit } = this.shapeInputs;
      let fIter = Array.from({ length: imageWidth }, () => Array(imageHeight).fill(0));

      let thetaR = Math.PI * theta / 180;
      let rSq, x0, y0, dX, dY, xx, yy, xTemp, iter;

      for (let u = 0; u < imageWidth; u++) {
          for (let v = 0; v < imageHeight; v++) {
              dX = (u - imageWidth / 2) / scale;
              dY = (v - imageHeight / 2) / scale;
              x0 = xCenter + dX * Math.cos(thetaR) - dY * Math.sin(thetaR);
              y0 = yCenter + dX * Math.sin(thetaR) + dY * Math.cos(thetaR);

              xx = x0;
              yy = y0;
              rSq = xx * xx + yy * yy;
              iter = 0;

              if (this.isMandArt()) {
                  let p = Math.sqrt((xx - 0.25) ** 2 + yy * yy);
                  let test1 = p - 2.0 * p * p + 0.25;
                  let test2 = (xx + 1.0) ** 2 + yy * yy;

                  if (xx < test1 || test2 < 0.0625) {
                      iter = iterationsMax;
                  } else {
                      for (let i = 1; i < iterationsMax; i++) {
                          if (rSq >= rSqLimit) break;
                          xTemp = xx * xx - yy * yy + x0;
                          yy = 2 * xx * yy + y0;
                          xx = xTemp;
                          rSq = xx * xx + yy * yy;
                          iter = i;
                      }
                  }
              } else {
                  for (let i = 1; i < iterationsMax; i++) {
                      if (rSq >= rSqLimit) break;
                      [xx, yy] = this.complexPow(xx, yy, this.powerInputs.mandPowerReal);
                      xx += x0;
                      yy += y0;
                      rSq = xx * xx + yy * yy;
                      iter = i;
                  }
              }

              fIter[u][v] = iter;
          }
      }
      return fIter;
  }

  renderMandelbrot(canvas) {
      let ctx = canvas.getContext("2d");
      let imgData = ctx.createImageData(this.shapeInputs.imageWidth, this.shapeInputs.imageHeight);
      let fIter = this.generateGrid();

      for (let x = 0; x < this.shapeInputs.imageWidth; x++) {
          for (let y = 0; y < this.shapeInputs.imageHeight; y++) {
              let index = (y * this.shapeInputs.imageWidth + x) * 4;
              let color = (fIter[x][y] / this.shapeInputs.iterationsMax) * 255;
              imgData.data[index] = color;
              imgData.data[index + 1] = color;
              imgData.data[index + 2] = color;
              imgData.data[index + 3] = 255;
          }
      }
      ctx.putImageData(imgData, 0, 0);
  }
}


function colorMandelbrot(canvas, fIter, hues) {
    let ctx = canvas.getContext("2d");
    let imgData = ctx.createImageData(canvas.width, canvas.height);

    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
            let index = (y * canvas.width + x) * 4;
            let iterValue = fIter[x][y] % hues.length; // Map iteration value to hue index
            let hue = hues[iterValue]; // Get corresponding hue

            imgData.data[index] = hue.r;
            imgData.data[index + 1] = hue.g;
            imgData.data[index + 2] = hue.b;
            imgData.data[index + 3] = 255; // Full opacity
        }
    }

    ctx.putImageData(imgData, 0, 0);
}
