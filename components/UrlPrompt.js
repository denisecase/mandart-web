document.getElementById("openUrlBtn")?.addEventListener("click", async () => {
    const defaultURL = "https://raw.githubusercontent.com/denisecase/MandArt-Discoveries/main/brucehjohnson/frame_pix/Frame54.mandart";

    const url = await openUrlPrompt(defaultURL);
    if (url) await loadMandArt(url, "", "Custom URL");
});

/**
 * Opens a large input box for entering a URL.
 */
export async function openUrlPrompt(defaultURL) {
    return new Promise((resolve) => {
        // Create modal elements
        const modal = document.createElement("div");
        modal.style.position = "fixed";
        modal.style.top = "50%";
        modal.style.left = "50%";
        modal.style.transform = "translate(-50%, -50%)";
        modal.style.background = "white";
        modal.style.padding = "15px";
        modal.style.border = "2px solid #000";
        modal.style.boxShadow = "0px 0px 10px rgba(0,0,0,0.2)";
        modal.style.zIndex = "1000";
        modal.style.width = "500px"; // Wider box
        modal.style.textAlign = "center";

        const label = document.createElement("p");
        label.textContent = "Enter the URL of the MandArt JSON:";

        const textarea = document.createElement("textarea");
        textarea.style.width = "100%";
        textarea.style.height = "80px"; // Makes it 4-5 lines long
        textarea.value = defaultURL;

        const btnContainer = document.createElement("div");
        btnContainer.style.marginTop = "10px";

        const okBtn = document.createElement("button");
        okBtn.textContent = "OK";
        okBtn.style.marginRight = "10px";

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Cancel";

        btnContainer.appendChild(okBtn);
        btnContainer.appendChild(cancelBtn);

        // Append elements
        modal.appendChild(label);
        modal.appendChild(textarea);
        modal.appendChild(btnContainer);
        document.body.appendChild(modal);

        // Handle button clicks
        okBtn.addEventListener("click", () => {
            resolve(textarea.value);
            document.body.removeChild(modal);
        });

        cancelBtn.addEventListener("click", () => {
            resolve(null);
            document.body.removeChild(modal);
        });

        // Focus on textarea
        textarea.focus();
    });
}
