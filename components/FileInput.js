export function setupFileInput() {
    const fileInput = document.getElementById("fileInput");
    if (!fileInput) {
        console.warn("⚠️ #fileInput not found! Retrying...");
        setTimeout(setupFileInput, 100);
        return;
    }

    fileInput?.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (file) {
          console.log(`📂 Selected file: ${file.name}`);
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              let jsonData = JSON.parse(e.target.result);
      
              jsonData.hues = jsonData.hues.map((hue) => ({
                r: hue.r ?? Math.round((hue.color?.red ?? 0) * 255),
                g: hue.g ?? Math.round((hue.color?.green ?? 0) * 255),
                b: hue.b ?? Math.round((hue.color?.blue ?? 0) * 255),
              }));
      
              console.log("✅ Processed MandArt JSON:", jsonData);
      
              // ✅ Update global state
              window.currentMandArt = jsonData;
              window.currentHues = jsonData.hues;
      
              // ✅ Fix the call: Make sure `source` contains the local file name
              const fileName = file.name.replace(".mandart", "");
              await mandArtLoader.loadMandArt(file.name, "", fileName);
      
              // ✅ Ensure UI updates
              if (window.canvasFunctions?.draw) {
                window.canvasFunctions.draw();
              }
            } catch (error) {
              console.error("❌ Error parsing MandArt file:", error);
              alert("Invalid MandArt JSON file. Please check the format.");
            }
          };
          reader.readAsText(file);
        }
      });
      
      
}

