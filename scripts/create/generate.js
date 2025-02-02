import { setErrorMessages } from "./error.js";
const { jsPDF } = window.jspdf;
let generatedPdfBlob = null;
document.getElementById("generatePdfButton").addEventListener("click", async () => {
  const generateButton = document.getElementById("generatePdfButton");
  generateButton.disabled = true;
  const doc = new jsPDF("p", "mm", "a4");
  const postcardWidth = 148;
  const postcardHeight = 100;
  let xOffset = 10;
  let yOffset = 10;
  const standPreviews = document.querySelectorAll("[id^='imagePreview']");
  
  standPreviews.forEach((preview, index) => {
    const imgElement = preview.querySelector("img");
    if (!imgElement || imgElement.src.includes("images/none.webp")) {
      errorMessages.push(`${index + 1}月がアップロードされていません。`);
    }
  });
  const imagePreviews = document.querySelectorAll("[id^='imagePreview']");
  imagePreviews.forEach((preview, index) => {
    const imgElement = preview.querySelector("img");
    if (imgElement && !imgElement.src.includes("images/none.webp")) {
      doc.addImage(imgElement.src, "JPEG", xOffset, yOffset, postcardWidth, postcardHeight, undefined, "FAST");
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
  const standImageElement = document.querySelector("#standview");
  if (standImageElement && standImageElement.src) {
    const standImageUrl = standImageElement.src;
    doc.addPage();
    doc.addImage(standImageUrl, "JPEG", 0, 0, 210, 297);
  } else {
    alert("スタンド画像が見つかりません。");
  }
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