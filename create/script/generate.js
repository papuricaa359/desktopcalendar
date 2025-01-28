const { jsPDF } = window.jspdf;
let currentErrorIndex = 0;
let errorMessages = [];
let generatedPdfBlob = null;
function showError() {
    const errorBox = document.getElementById("error-box");
    const overlay = document.getElementById("overlay");
    const errMessage = document.getElementById("errmesse");
  
    if (currentErrorIndex < errorMessages.length) {
      errMessage.textContent = errorMessages[currentErrorIndex];
      overlay.style.display = "block";
      errorBox.style.display = "flex";
    }
  }
  window.closeErrorBox = function () {
    const errorBox = document.getElementById("error-box");
    const overlay = document.getElementById("overlay");
    overlay.style.display = "none";
    errorBox.style.display = "none";
  
    currentErrorIndex++;
    if (currentErrorIndex < errorMessages.length) {
      showError();
    }
  };

  document.getElementById("generatePdfButton").addEventListener("click", () => {
    const generateButton = document.getElementById("generatePdfButton");
    generateButton.disabled = true;
    const doc = new jsPDF("p", "mm", "a4");
    const postcardWidth = 148;
    const postcardHeight = 100;
    let xOffset = 10;
    let yOffset = 10;
    errorMessages = [];
    currentErrorIndex = 0;
    const imagePreviews = document.querySelectorAll("[id^='imagePreview']");
    imagePreviews.forEach((preview, index) => {
      const imgElement = preview.querySelector("img");
      if (!imgElement || imgElement.src.includes("img/none.webp")) {
        errorMessages.push(`画像${index + 1}がアップロードされていません。`);
      }
    });
    if (errorMessages.length > 0) {
      showError();
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
    const pdfUrl = URL.createObjectURL(generatedPdfBlob);
    window.open(pdfUrl);
  });
  document.getElementById("viewStandButton").addEventListener("click", () => {
    const standImage = new Image();
    standImage.src = "frame/stand.png";
    const doc = new jsPDF("p", "mm", "a4");
    standImage.onload = () => {
      const standImageWidth = 210;
      const standImageHeight = 297;
      const squareWidth = 24.9;
      const squareHeight = 24.9;
      const startX = 29.95;
      const startY = 186;
      let squareX = startX;
      let squareY = startY;
      doc.addImage(standImage.src, "PNG", 0, 0, standImageWidth, standImageHeight);
      const squarePreviews = document.querySelectorAll("[id^='squarePreview']");
      squarePreviews.forEach((preview, index) => {
        const squareImgElement = preview;
        const squareDataUrl = squareImgElement.src;
        doc.addImage(squareDataUrl, "PNG", squareX, squareY, squareWidth, squareHeight);
        squareX += squareWidth;
        if ((index + 1) % 6 === 0) {
          squareX = startX;
          squareY += squareHeight + 34.6;
        }
        squareImgElement.remove();
      });
      const standBlob = doc.output("blob");
      const standUrl = URL.createObjectURL(standBlob);
      window.open(standUrl);
    };
    standImage.onerror = () => {
      console.error("スタンド画像の読み込みに失敗しました。");
    };
  });
  document.getElementById("closebutton").addEventListener("click", () => {
    location.href = "/";
  });
