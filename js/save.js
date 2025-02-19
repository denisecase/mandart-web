// save.js

function getActiveFilename(extension = "mandart") {
  const drawingNameElement = document.getElementById("drawingName");
  let activeName = drawingNameElement
    ? drawingNameElement.textContent.trim()
    : "untitled";
  // Ensure it's a safe filename
  activeName = activeName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
  return `${activeName}.${extension}`;
}

function saveMandArtFile(picdef, filename) {
  console.log("Saving MandArt File");
  if (!picdef || Object.keys(picdef).length === 0) {
    console.error("Error: MandArt data is empty or invalid.");
    alert("Error: Cannot save an empty MandArt file.");
    return;
  }
  const jsonString = JSON.stringify(picdef, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  triggerFileDownload(blob, filename);
  console.log(`Saved Mandart Inputs File: ${filename}`);
}

function saveCanvasAsPNG(canvas) {
  console.log("Saving PNG");
  const filename = getActiveFilename("png");
  console.log("Current filename:", filename);
  canvas.toBlob((blob) => triggerFileDownload(blob, filename), "image/png");
  console.log(`Saved PNG: ${filename}`);
}

function exportGridToCSV(fIter) {
  if (!fIter) {
    console.error("No grid data found.");
    return;
  }
  const filename = getActiveFilename("csv");
  console.log("Current filename:", filename);
  let csvContent = fIter.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  triggerFileDownload(blob, filename);
  console.log(`Saved Grid CSV: ${filename}`);
}

function triggerFileDownload(blob, filename) {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl); // Free memory
  console.log(`Triggered file download: ${filename}`);
}