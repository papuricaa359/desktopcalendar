import { processImage_type1 } from "./type1.js";
import { processImage_type2 } from "./type2.js";
import { processImage_type3 } from "./type3.js";
import { fontstype } from "./fontselect.js";
let selectedType = "1";
document.querySelectorAll('input[name="type"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
        selectedType = e.target.value;
        const visibleInput = document.querySelector(".input[style*='display: block;'] input[type='file']");
        if (visibleInput) {
            const index = parseInt(visibleInput.id.replace("imageInput", ""), 10);
            const file = visibleInput.files[0];
            if (file) {
                const framePath = `/desktopcalendar/frame/2025/type${selectedType}/${fontstype}/${index}.png`;
                const previewId = `imagePreview${index}`;
                handleFileChange(visibleInput, index, file, framePath, previewId);
            }
        }
    });
});
document.querySelectorAll("[id^='imageInput']").forEach((fileInput, index) => {
    fileInput.addEventListener("change", (e) => {
        const file = fileInput.files[0];
        if (file) {
            const framePath = `/desktopcalendar/frame/2025/type${selectedType}/${fontstype}/${index + 1}.png`;
            const previewId = `imagePreview${index + 1}`;
            handleFileChange(fileInput, index + 1, file, framePath, previewId);
        }
    });
});
function handleFileChange(fileInput, index, file, framePath, previewId) {
    if (selectedType === "1") {
        processImage_type1(file, framePath, previewId);
    } else if (selectedType === "2") {
        processImage_type2(file, framePath, previewId);
    } else if (selectedType === "3") {
        processImage_type3(file, framePath, previewId);
    }
}