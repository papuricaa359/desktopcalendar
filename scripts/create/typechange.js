import { processImage_type1 } from "./type1.js";
import { processImage_type2 } from "./type2.js";
import { processImage_type3 } from "./type3.js";
let selectedTypes = {};
document.querySelectorAll('input[name="type"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
        const monthIndex = parseInt(e.target.dataset.month, 10);
        selectedTypes[monthIndex] = e.target.value;
        const fileInput = document.getElementById(`imageInput${monthIndex + 1}`);
        if (fileInput && fileInput.files[0]) {
            const file = fileInput.files[0];
            const framePath = `/desktopcalendar/frame/2025/type${selectedTypes[monthIndex]}/${monthIndex + 1}.png`;
            const previewId = `imagePreview${monthIndex + 1}`;
            handleFileChange(fileInput, monthIndex, file, framePath, previewId);
        }
    });
});
function handleFileChange(fileInput, index, file, framePath, previewId) {
    const type = selectedTypes[index] || "1";
    if (type === "1") {
        processImage_type1(file, framePath, previewId);
    } else if (type === "2") {
        processImage_type2(file, framePath, previewId);
    } else if (type === "3") {
        processImage_type3(file, framePath, previewId);
    }
}
document.querySelectorAll("[id^='imageInput']").forEach((fileInput, index) => {
    selectedTypes[index] = "1";
    fileInput.addEventListener("change", (e) => {
        const file = fileInput.files[0];
        const framePath = `/desktopcalendar/frame/2025/type${selectedTypes[index]}/${index + 1}.png`;
        const previewId = `imagePreview${index + 1}`;
        handleFileChange(fileInput, index, file, framePath, previewId);
    });
});