// utils/ImageUtils.js

/**
 * Converts a Canvas to a BMP file and triggers download.
 */
export function saveCanvasAsBMP(canvas, filename = "art.bmp") {
    try {
        const ctx = canvas.getContext("2d");
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const headerSize = 54;
        const rowSize = ((canvas.width * 3 + 3) & ~3);
        const fileSize = headerSize + rowSize * canvas.height;
        const buffer = new ArrayBuffer(fileSize);
        const view = new DataView(buffer);

        let offset = 0;

        function writeUint32(value) {
            view.setUint32(offset, value, true);
            offset += 4;
        }

        function writeUint16(value) {
            view.setUint16(offset, value, true);
            offset += 2;
        }

        // BMP Header
        writeUint16(0x4D42);
        writeUint32(fileSize);
        writeUint32(0);
        writeUint32(headerSize);

        // DIB Header
        writeUint32(40);
        writeUint32(canvas.width);
        writeUint32(-canvas.height);
        writeUint16(1);
        writeUint16(24);
        writeUint32(0);
        writeUint32(rowSize * canvas.height);
        writeUint32(0);
        writeUint32(0);
        writeUint32(0);
        writeUint32(0);

        let dataOffset = headerSize;
        for (let y = 0; y < canvas.height; y++) {
            let rowOffset = dataOffset + rowSize * y;
            for (let x = 0; x < canvas.width; x++) {
                let i = (y * canvas.width + x) * 4;
                view.setUint8(rowOffset++, imageData.data[i + 2]);
                view.setUint8(rowOffset++, imageData.data[i + 1]);
                view.setUint8(rowOffset++, imageData.data[i]);
            }
        }

        triggerFileDownload(new Blob([buffer], { type: "image/bmp" }), filename);
    } catch (error) {
        console.error("❌ Error saving BMP:", error);
    }
}
