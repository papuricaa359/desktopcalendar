import { processImage_type1 } from "./type1.js";
import { processImage_type2 } from "./type2.js";
import { processImage_type3 } from "./type3.js";
import { fontstype } from "./fontselect.js";
export let selectedType = 0;
document.getElementById("type1").addEventListener("click", function () {
    selectedType = 1;
    updateImagesForSelectedType();
    document.querySelector(".typeselect").style.display = "none";
});
document.getElementById("type2").addEventListener("click", function () {
    selectedType = 2;
    updateImagesForSelectedType();
    document.querySelector(".typeselect").style.display = "none";
});
document.getElementById("type3").addEventListener("click", function () {
    selectedType = 3;
    updateImagesForSelectedType();
    document.querySelector(".typeselect").style.display = "none";
});
document.querySelector(".opentype").addEventListener("click", function () {
    document.querySelector(".typeselect").style.display = "flex";
});
document.querySelectorAll("[id^='imageInput']").forEach((fileInput, index) => {
    fileInput.addEventListener("change", (e) => {
        const file = fileInput.files[0];
        if (file && selectedType !== 0) {
            const framePath = `/desktopcalendar/frame/2025/type${selectedType}/${fontstype}/${index + 1}.png`;
            const previewId = `imagePreview${index + 1}`;
            handleFileChange(fileInput, index + 1, file, framePath, previewId);
        }
    });
});
function handleFileChange(fileInput, index, file, framePath, previewId) {
    if (selectedType === 1) {
        processImage_type1(file, framePath, previewId);
    } else if (selectedType === 2) {
        processImage_type2(file, framePath, previewId);
    } else if (selectedType === 3) {
        processImage_type3(file, framePath, previewId);
    }
}
function updateImagesForSelectedType() {
    document.querySelectorAll("[id^='imageInput']").forEach((fileInput, index) => {
        if (fileInput.closest('.input').style.display !== 'none') {
            const file = fileInput.files[0];
            if (file) {
                const framePath = `/desktopcalendar/frame/2025/type${selectedType}/${fontstype}/${index + 1}.png`;
                const previewId = `imagePreview${index + 1}`;
                handleFileChange(fileInput, index + 1, file, framePath, previewId);
            }
        }
    });
}