const { jsPDF } = window.jspdf;

document.addEventListener("DOMContentLoaded", function () {
  let currentMonthIndex = 0;

  function updateMonthVisibility() {
    document.querySelectorAll(".upload-container").forEach((container, index) => {
      container.style.display = index === currentMonthIndex ? "block" : "none";
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

  async function processImage(file, framePath, previewId, squareFramePath, squarePreviewId) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const targetHeight = 1741;
          const targetWidth = (targetHeight * 3) / 4;

          let cropWidth, cropHeight;
          if (img.width / img.height > 3 / 4) {
            cropHeight = img.height;
            cropWidth = cropHeight * 3 / 4;
          } else {
            cropWidth = img.width;
            cropHeight = cropWidth * 4 / 3;
          }

          const cropX = (img.width - cropWidth) / 2;
          const cropY = (img.height - cropHeight) / 2;

          canvas.width = 2577;
          canvas.height = 1741;

          ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, targetWidth, targetHeight);

          const resizedDataUrl = canvas.toDataURL();

          // 表示エリアに画像を追加
          const imgElement = new Image();
          imgElement.src = resizedDataUrl;

          imgElement.style.width = "5vw"; // 幅を5vwに設定
          imgElement.style.height = "auto"; // 高さはアスペクト比を維持

          // プレビューエリアに画像を表示
          const previewContainer = document.getElementById(previewId);
          previewContainer.innerHTML = ""; // 既存の内容をクリア
          previewContainer.appendChild(imgElement);

          resolve(resizedDataUrl);
        };

        img.onerror = () => {
          console.error("画像処理エラー:", file.name);
          reject(new Error("画像処理エラー"));
        };
      };

      reader.onerror = () => {
        console.error("画像読み込みエラー:", file.name);
        reject(new Error("画像読み込みエラー"));
      };
      reader.readAsDataURL(file);
    });
  }

  function handleImageUpload(inputId, framePath, previewId, squareFramePath, squarePreviewId) {
    const fileInput = document.getElementById(inputId);
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log("処理中の画像:", file.name);
        processImage(file, framePath, previewId, squareFramePath, squarePreviewId)
          .catch((err) => console.error(err.message));
      }
    });
  }

  for (let i = 1; i <= 12; i++) {
    handleImageUpload(`imageInput${i}`, `frame/${i}.png`, `imagePreview${i}`, `frame/square/${i}.png`, `squarePreview${i}`);
  }

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

    const creatingIndicator = document.getElementById("creating");
    creatingIndicator.style.display = "flex";

    const doc = new jsPDF("p", "mm", "a4");
    const postcardWidth = 148;
    const postcardHeight = 100;
    const margin = 10;
    let xOffset = margin;
    let yOffset = margin;

    const imagePreviews = document.querySelectorAll("[id^='imagePreview']");
    const squarePreviews = document.querySelectorAll("[id^='squarePreview']");
    const totalImages = imagePreviews.length;
    let allImagesUploaded = true;
    errorMessages = [];

    imagePreviews.forEach((preview, index) => {
      const imgElement = preview.querySelector("img");
      if (!imgElement) {
        console.error(`画像${index + 1}が無効です`);
        allImagesUploaded = false;
        errorMessages.push(`画像${index + 1}が無効です`);
        return;
      }
    });

    if (!allImagesUploaded) {
      showError();
      generateButton.disabled = false;
      creatingIndicator.style.display = "none";
      return;
    }

    imagePreviews.forEach((preview, index) => {
      const imgElement = preview.querySelector("img");
      if (imgElement) {
        const dataUrl = imgElement.src;
        if (dataUrl.includes("img/none.png")) {
          allImagesUploaded = false;
          errorMessages.push(`画像${index + 1}がアップロードされていません`);
        } else {
          doc.addImage(dataUrl, "PNG", xOffset, yOffset, postcardWidth, postcardHeight);
          yOffset += postcardHeight + margin;

          if ((index + 1) % 2 === 0) {
            yOffset = margin;
            xOffset += postcardWidth + margin;

            if (index + 1 < imagePreviews.length) {
              doc.addPage();
              xOffset = margin;
            }
          }
        }
      }
    });

    if (!allImagesUploaded) {
      showError();
      generateButton.disabled = false;
      creatingIndicator.style.display = "none";
      return;
    }

    const finalImage = new Image();
    finalImage.src = "img/stand.png";

    finalImage.onload = () => {
      doc.addPage();
      const finalImageWidth = 210;
      const finalImageHeight = 297;
      doc.addImage(finalImage.src, "PNG", 0, 0, finalImageWidth, finalImageHeight);

      const pdfBlob = doc.output("blob");
      document.getElementById("viewPdfButton").style.display = "block";
      creatingIndicator.style.display = "none";
    };
  });

  document.getElementById("viewPdfButton").addEventListener("click", () => {
    if (generatedPdfBlob) {
      const pdfUrl = URL.createObjectURL(generatedPdfBlob);
      const pdfWindow = window.open(pdfUrl);
      if (!pdfWindow) {
        alert("ポップアップブロックが有効になっています。PDFを表示するには、ポップアップを許可してください。");
      }
    } else {
      alert("PDFがまだ生成されていません。");
    }
  });

  updateMonthVisibility();
});
