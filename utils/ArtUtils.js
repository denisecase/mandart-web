export class ArtImageShapeInputs {
    constructor(imageHeight, imageWidth, iterationsMax, scale, xCenter, yCenter, theta, dFIterMin, rSqLimit, mandPowerReal) {
        this.imageHeight = Number(imageHeight) || 1000;
        this.imageWidth = Number(imageWidth) || 1000;
        this.iterationsMax = Number(iterationsMax) || 100;
        this.scale = Number(scale) || 200;
        this.xCenter = Number(xCenter) || 0;
        this.yCenter = Number(yCenter) || 0;
        this.theta = Number(theta) || 0;
        this.dFIterMin = Number(dFIterMin) || 0;
        this.rSqLimit = Number(rSqLimit) || 4;
        this.mandPowerReal = Number(mandPowerReal) || 2;  // Moved here
    }
}

export class ArtImageColorInputs {
    constructor(nBlocks, huesLength, spacingColorFar, spacingColorNear, yY, mandColor) {
        this.nBlocks = Number(nBlocks) || 10;
        this.huesLength = Number(huesLength) || 256;
        this.spacingColorFar = Number(spacingColorFar) || 1.0;
        this.spacingColorNear = Number(spacingColorNear) || 0.1;
        this.yY = Number(yY) || 0;
        this.mandColor = mandColor || {};
    }
}

export class ArtImage {
    constructor(picdef) {
        if (!picdef) throw new Error("❌ picdef is required to initialize ArtImage.");

        this.shapeInputs = new ArtImageShapeInputs(
            picdef.imageHeight,
            picdef.imageWidth,
            picdef.iterationsMax,
            picdef.scale,
            picdef.xCenter,
            picdef.yCenter,
            -picdef.theta,
            picdef.dFIterMin,
            picdef.rSqLimit,
            picdef.mandPowerReal // Now part of shape inputs
        );

        this.colorInputs = new ArtImageColorInputs(
            picdef.nBlocks,
            picdef.hues.length,
            picdef.spacingColorFar,
            picdef.spacingColorNear,
            picdef.yY,
            picdef.mandColor
        );
    }

    generateGrid() {
        const {
            imageWidth,
            imageHeight,
            iterationsMax,
            scale,
            xCenter,
            yCenter,
            theta,
            rSqLimit,
            mandPowerReal, // Now extracted from shapeInputs
        } = this.shapeInputs;

        const thetaR = (Math.PI * theta) / 180;

        // Initialize grid efficiently
        const fIter = new Array(imageHeight).fill(0).map(() => new Array(imageWidth).fill(0));

        for (let u = 0; u < imageWidth; u++) {
            for (let v = 0; v < imageHeight; v++) {
                const dX = (u - imageWidth / 2) / scale;
                const dY = (v - imageHeight / 2) / scale;
                const x0 = xCenter + dX * Math.cos(thetaR) - dY * Math.sin(thetaR);
                const y0 = yCenter + dX * Math.sin(thetaR) + dY * Math.cos(thetaR);

                let xx = x0;
                let yy = y0;
                let rSq = xx * xx + yy * yy;
                let iter = 0;

                while (iter < iterationsMax && rSq < rSqLimit) {
                    [xx, yy] = this.complexPow(xx, yy, mandPowerReal);
                    xx += x0;
                    yy += y0;
                    rSq = xx * xx + yy * yy;
                    iter++;
                }

                fIter[v][u] = iter;
            }
        }
        return fIter;
    }

    complexPow(baseX, baseY, powerReal) {
        const r = Math.hypot(baseX, baseY); // More numerically stable
        const theta = Math.atan2(baseY, baseX);
        const newR = Math.pow(r, powerReal);
        const newTheta = powerReal * theta;
        return [newR * Math.cos(newTheta), newR * Math.sin(newTheta)];
    }

    renderMandelbrot(canvas, hues) {
        if (!canvas || !hues || hues.length === 0) {
            console.error("❌ Invalid canvas or hues data.");
            return;
        }

        const ctx = canvas.getContext("2d");
        const width = canvas.width;
        const height = canvas.height;
        const fIter = this.generateGrid();
        const imgData = ctx.createImageData(width, height);

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const index = (y * width + x) * 4;
                const iterValue = fIter[y][x] % hues.length;
                const hue = hues[iterValue];

                imgData.data[index] = hue.r;
                imgData.data[index + 1] = hue.g;
                imgData.data[index + 2] = hue.b;
                imgData.data[index + 3] = 255; // Full opacity
            }
        }

        ctx.putImageData(imgData, 0, 0);
        console.log("✅ Mandelbrot rendering completed!");
    }
}
