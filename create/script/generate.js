import { setErrorMessages } from "./error.js";
const { jsPDF } = window.jspdf;
let generatedPdfBlob = null;
document.getElementById("generatePdfButton").addEventListener("click", () => {
  const generateButton = document.getElementById("generatePdfButton");
  generateButton.disabled = true;
  const doc = new jsPDF("p", "mm", "a4");
  const postcardWidth = 148;
  const postcardHeight = 100;
  let xOffset = 10;
  let yOffset = 10;
  let errorMessages = [];
  const imagePreviews = document.querySelectorAll("[id^='imagePreview']");
  imagePreviews.forEach((preview, index) => {
    const imgElement = preview.querySelector("img");
    if (!imgElement || imgElement.src.includes("img/none.webp")) {
      errorMessages.push(`画像${index + 1}がアップロードされていません。`);
    }
  });
  if (errorMessages.length > 0) {
    setErrorMessages(errorMessages);
    generateButton.disabled = false;
    return;
  }
  imagePreviews.forEach((preview, index) => {
    const imgElement = preview.querySelector("img");
    if (imgElement && !imgElement.src.includes("img/none.webp")) {
      doc.addImage(imgElement.src, "PNG", xOffset, yOffset, postcardWidth, postcardHeight);
      yOffset += postcardHeight;
      if ((index + 1) % 2 === 0) {
        yOffset = 10;
        xOffset += postcardWidth;
        if (index + 1 < imagePreviews.length) {
          doc.addPage();
          xOffset = 10;
          yOffset = 10;
        }
      }
    }
  });
  generatedPdfBlob = doc.output("blob");
  document.getElementById("fin").style.display = "flex";
  generateButton.disabled = false;
});
document.getElementById("viewPdfButton").addEventListener("click", () => {
  if (generatedPdfBlob) {
    const pdfUrl = URL.createObjectURL(generatedPdfBlob);
    window.open(pdfUrl);
  } else {
    alert("PDFが生成されていません。");
  }
});
document.getElementById("closebutton").addEventListener("click", () => {
  location.href = "/desktopcalendar/";
});
