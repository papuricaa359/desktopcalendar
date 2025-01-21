const { jsPDF } = window.jspdf;

document.addEventListener("DOMContentLoaded", function () {
  let currentMonthIndex = 0;
  let generatedPdfBlob = null;

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

  for (let i = 1; i <= 12; i++) {
    const previewElement = document.getElementById(`imagePreview${i}`);
    const imgElement = document.createElement("img");
    imgElement.src = "img/none.png";
    imgElement.style.width = "50vw";
    previewElement.innerHTML = "";
    previewElement.appendChild(imgElement);
  }

  // 画像処理関数
  async function processImage(file, framePath, previewId, squarePreviewId) {
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

          // 正方形画像を作成
          const squareCanvas = document.createElement("canvas");
          const squareCtx = squareCanvas.getContext("2d");
          const size = Math.min(img.width, img.height);
          squareCanvas.width = size;
          squareCanvas.height = size;

          const squareX = (img.width - size) / 2;
          const squareY = (img.height - size) / 2;

          squareCtx.drawImage(img, squareX, squareY, size, size, 0, 0, size, size);

          // フレーム画像を描画
          const frameImg = new Image();
          frameImg.src = framePath;

          frameImg.onload = () => {
            ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL();
            resolve(dataUrl);

            // 通常のプレビュー画像を表示
            const imgElement = document.createElement("img");
            imgElement.src = dataUrl;
            imgElement.style.width = "50vw";
            imgElement.style.display = "block";
            document.getElementById(previewId).innerHTML = "";
            document.getElementById(previewId).appendChild(imgElement);

            // 正方形画像を表示
            const squareDataUrl = squareCanvas.toDataURL();
            const squareImgElement = document.getElementById(squarePreviewId); // 初期のsquarePreviewを取得
            squareImgElement.src = squareDataUrl; // アップロードされた画像で置き換える
          };

          frameImg.onerror = () => reject(new Error("フレーム画像の読み込みに失敗"));
        };

        img.onerror = () => reject(new Error("画像処理エラー"));
      };

      reader.onerror = () => reject(new Error("画像読み込みエラー"));
      reader.readAsDataURL(file);
    });
  }

  function handleImageUpload(inputId, framePath, previewId, squarePreviewId) {
    const fileInput = document.getElementById(inputId);
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        processImage(file, framePath, previewId, squarePreviewId).catch((err) => console.error(err.message));
      }
    });
  }

  for (let i = 1; i <= 12; i++) {
    handleImageUpload(`imageInput${i}`, `frame/${i}.png`, `imagePreview${i}`, `squarePreview${i}`);
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

    const doc = new jsPDF("p", "mm", "a4");
    const postcardWidth = 148;
    const postcardHeight = 100;
    let xOffset = 10;
    let yOffset = 10;

    const imagePreviews = document.querySelectorAll("[id^='imagePreview']");

    let allImagesUploaded = true;
    errorMessages = [];

    imagePreviews.forEach((preview, index) => {
      const imgElement = preview.querySelector("img");
      if (imgElement) {
        const dataUrl = imgElement.src;
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
              if (index + 1 < imagePreviews.length) {
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

    if (!allImagesUploaded) {
      showError();
      generateButton.disabled = false;
      return;
    }

    const finalImage = new Image();
    finalImage.src = "img/stand.png";

    finalImage.onload = () => {
      doc.addPage();
      const finalImageWidth = 210;
      const finalImageHeight = 297;
      doc.addImage(finalImage.src, "PNG", 0, 0, finalImageWidth, finalImageHeight);

      const squarePreviews = [];
      for (let i = 1; i <= 12; i++) {
        const squarePreviewImg = document.getElementById(`squarePreview${i}`).querySelector("img");
        if (squarePreviewImg) {
          squarePreviews.push(squarePreviewImg.src);
        }
      }

      const scaleFactor = 25 * 2.83465;
      const offsetX = 10;
      const offsetY = 10;
      const gap = 10;

      for (let i = 0; i < 6; i++) {
        const squareDataUrl = squarePreviews[i];
        const xPos = offsetX + (i % 3) * (scaleFactor + gap);
        const yPos = offsetY + Math.floor(i / 3) * (scaleFactor + gap);

        const imgElement = document.createElement("img");
        imgElement.src = squareDataUrl;
        imgElement.onload = () => {
          const scaleHeight = (imgElement.height * scaleFactor) / imgElement.width;
          doc.addImage(squareDataUrl, "PNG", xPos, yPos, scaleFactor, scaleHeight);

          if (i === 11) {
            const pdfBlob = doc.output("blob");
            const pdfUrl = URL.createObjectURL(pdfBlob);

            // 新しいタブでPDFを表示
            const pdfWindow = window.open(pdfUrl, "_blank");
            if (pdfWindow) pdfWindow.focus();

            generateButton.disabled = false;
          }
        };
      }
    };

    finalImage.onerror = () => {
      generateButton.disabled = false;
    };
  });
});
