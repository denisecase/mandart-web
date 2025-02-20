// utils/ArtImage.js

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
            picdef.rSqLimit
        );

        this.colorInputs = new ArtImageColorInputs(
            picdef.nBlocks,
            picdef.hues.length,
            picdef.spacingColorFar,
            picdef.spacingColorNear,
            picdef.yY,
            picdef.mandColor
        );

        this.powerInputs = new ArtImagePowerInputs(picdef.mandPowerReal);
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
        } = this.shapeInputs;

        const thetaR = (Math.PI * theta) / 180;
        const powerReal = this.powerInputs.mandPowerReal || 2; // Default to power 2 if missing

        // Initialize grid efficiently
        const fIter = new Array(imageWidth).fill(0).map(() => new Array(imageHeight).fill(0));

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
                    [xx, yy] = this.complexPow(xx, yy, powerReal);
                    xx += x0;
                    yy += y0;
                    rSq = xx * xx + yy * yy;
                    iter++;
                }

                fIter[u][v] = iter;
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
                const iterValue = fIter[x][y] % hues.length;
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

export async function populateMandartDropdown(selectElementId = "mandartSelect") {
    try {
        console.log("📂 Fetching MandArt discoveries...");
        const response = await fetch("assets/mandart_discoveries.json");

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("✅ Loaded MandArt Discoveries:", data);

        const mandartSelect = document.getElementById(selectElementId);
        if (!mandartSelect) {
            console.error(`❌ Dropdown element #${selectElementId} not found.`);
            return;
        }

        mandartSelect.innerHTML = `<option value="">Select a MandArt</option>`;
        data.sort((a, b) => a.name.localeCompare(b.name));

        data.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.name;
            option.textContent = item.name;
            mandartSelect.appendChild(option);
        });
    } catch (error) {
        console.error("❌ Failed to load MandArt file list:", error);
    }
}

