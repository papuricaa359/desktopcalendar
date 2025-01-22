const { jsPDF } = window.jspdf;
document.addEventListener("DOMContentLoaded", function () {
  let currentMonthIndex = 0;

  function updateMonthVisibility() {
    document.querySelectorAll(".upload-container").forEach((container, index) => {
      if (index === currentMonthIndex) {
        container.style.display = "block";
      } else {
        container.style.display = "none";
      }
    });
    document.querySelector(".prev-btn").style.display = currentMonthIndex === 0 ? "none" : "inline-block";
    document.querySelector(".next-btn").style.display = currentMonthIndex === 11 ? "none" : "inline-block";
    document.querySelector("#generatePdfButton").style.display = currentMonthIndex === 11 ? "inline-block" : "none";
  }

  document.querySelector(".next-btn").addEventListener("click", () => {
    if (currentMonthIndex < 11) {
      currentMonthIndex++;
      updateMonthVisibility();
    }
  });

  document.querySelector(".prev-btn").addEventListener("click", () => {
    if (currentMonthIndex > 0) {
      currentMonthIndex--;
      updateMonthVisibility();
    }
  });

  // すべての月のアップロードフィールドにイベントリスナーを追加
  function handleImageUpload(inputId, framePath, previewId, squareFramePath, squarePreviewId) {
    const fileInput = document.getElementById(inputId);
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        processImage(file, framePath, previewId, squareFramePath, squarePreviewId).catch((err) => console.error(err.message));
      }
    });
  }

  // 画像アップロードフィールドをすべて動的に作成
  function createUploadFields() {
    for (let i = 1; i <= 12; i++) {
      handleImageUpload(
        `imageInput${i}`, 
        `frame/${i}.png`, 
        `imagePreview${i}`, 
        `frame/square/${i}.png`, 
        `squarePreview${i}`
      );
    }
  }

  createUploadFields();

  let currentErrorIndex = 0;
  let errorMessages = [];

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

    const imagePreviews = document.querySelectorAll("[id^='imagePreview']");
    const totalImages = imagePreviews.length;
    let allImagesUploaded = true;
    errorMessages = [];

    // 画像をPDFに追加
    imagePreviews.forEach((preview, index) => {
      const imgElement = preview.querySelector("img");
      if (imgElement) {
        const dataUrl = imgElement.src;

        // none.png が表示されている場合はエラーとして扱う
        if (dataUrl.includes("img/none.png")) {
          allImagesUploaded = false;
          errorMessages.push(`画像${index + 1}がアップロードされていません`);
        } else {
          if (index % 2 === 0) {
            doc.addImage(dataUrl, "PNG", xOffset, yOffset, postcardWidth, postcardHeight);
          } else {
            yOffset += postcardHeight;
            doc.addImage(dataUrl, "PNG", xOffset, yOffset, postcardWidth, postcardHeight);
            if (index % 2 === 1) {
              yOffset = 10;
              if (index + 1 < totalImages) {
                doc.addPage();
              }
            }
          }
        }
      } else {
        allImagesUploaded = false;
        errorMessages.push(`画像${index + 1}がアップロードされていません`);
      }
    });

    // エラーがあれば表示
    if (!allImagesUploaded) {
      showError();
      generateButton.disabled = false;
      return;
    }

    // 最後のページに img/stand.png を全画面表示し、squarePreview 画像を重ねる
    const finalImage = new Image();
    finalImage.src = "img/stand.png";

    finalImage.onload = () => {
      doc.addPage();
      const finalImageWidth = 210;
      const finalImageHeight = 297;
      doc.addImage(finalImage.src, "PNG", 0, 0, finalImageWidth, finalImageHeight);

      let squareX = 0;
      let squareY = 212.25;
      const squareSize = 24.66;
      const squaresPerRow = 6;
      const totalSquareImages = 12;
      const marginX = 30.75;

      for (let i = 1; i <= totalSquareImages; i++) {
        const squareImg = document.getElementById(`squarePreview${i}`);
        if (squareImg) {
          const squareDataUrl = squareImg.src;
          doc.addImage(squareDataUrl, "PNG", marginX + squareX, squareY, squareSize, squareSize);

          squareX += squareSize;
          if ((i % squaresPerRow === 0) || (i === totalSquareImages)) {
            squareX = 0;
            squareY += squareSize;
          }
        }
      }

      // PDFを生成
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      generatedPdfBlob = pdfBlob;

      // PDF表示ボタンを表示
      const viewPdfButton = document.getElementById("viewPdfButton");
      viewPdfButton.style.display = "inline-block";
      viewPdfButton.disabled = false;

      setTimeout(() => generateButton.disabled = false, 1000);
    };

    finalImage.onerror = () => {
      generateButton.disabled = false;
    };
  });

  // PDF表示ボタンイベント
  document.getElementById("viewPdfButton").addEventListener("click", () => {
    if (generatedPdfBlob) {
      const pdfUrl = URL.createObjectURL(generatedPdfBlob);
      const pdfWindow = window.open(pdfUrl, "_blank");
      if (pdfWindow) pdfWindow.focus();
    } else {
      alert("PDFがまだ生成されていません");
    }
  });

  updateMonthVisibility();
});
