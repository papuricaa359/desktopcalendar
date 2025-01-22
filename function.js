const { jsPDF } = window.jspdf;

document.addEventListener("DOMContentLoaded", function () {
  let currentMonthIndex = 0;
  let generatedPdfBlob = null;  // PDFのBlobを格納する変数

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

          const squareCanvas = document.createElement("canvas");
          const squareCtx = squareCanvas.getContext("2d");
          const size = Math.min(img.width, img.height);
          squareCanvas.width = size;
          squareCanvas.height = size;

          const squareX = (img.width - size) / 2;
          const squareY = (img.height - size) / 2;

          squareCtx.drawImage(img, squareX, squareY, size, size, 0, 0, size, size);

          const squareFrameImg = new Image();
          squareFrameImg.src = squareFramePath;

          squareFrameImg.onload = () => {
            squareCtx.drawImage(squareFrameImg, 0, 0, squareCanvas.width, squareCanvas.height);
            const squareDataUrl = squareCanvas.toDataURL();

            const frameImg = new Image();
            frameImg.src = framePath;

            frameImg.onload = () => {
              ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL();

              // 使用後に画像のURLを解放
              URL.revokeObjectURL(img.src);
              URL.revokeObjectURL(squareFrameImg.src);
              URL.revokeObjectURL(frameImg.src);

              // 画像の参照をクリア
              img.src = null;
              squareFrameImg.src = null;
              frameImg.src = null;

              resolve(dataUrl);

              const imgElement = document.createElement("img");
              imgElement.src = dataUrl;
              imgElement.style.width = "50vw";
              document.getElementById(previewId).innerHTML = "";
              document.getElementById(previewId).appendChild(imgElement);

              const squareImgElement = document.getElementById(squarePreviewId);
              squareImgElement.src = squareDataUrl;

              // 正方形画像のURLも解放
              URL.revokeObjectURL(squareDataUrl);
            };

            frameImg.onerror = () => reject(new Error("フレーム画像の読み込みに失敗"));
          };

          squareFrameImg.onerror = () => reject(new Error("正方形フレーム画像の読み込みに失敗"));
        };

        img.onerror = () => reject(new Error("画像処理エラー"));
      };

      reader.onerror = () => reject(new Error("画像読み込みエラー"));
      reader.readAsDataURL(file);
    });
  }

  function handleImageUpload(inputId, framePath, previewId, squareFramePath, squarePreviewId) {
    const fileInput = document.getElementById(inputId);
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        processImage(file, framePath, previewId, squareFramePath, squarePreviewId).catch((err) => console.error(err.message));
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

  document.getElementById("generatePdfButton").addEventListener("click", async () => {
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

    async function processPage(imagesToProcess, currentPageIndex) {
      if (currentPageIndex > 0) {
        doc.addPage();
      }

      for (let i = 0; i < imagesToProcess.length; i++) {
        const imgElement = imagesToProcess[i].querySelector("img");
        if (imgElement) {
          const dataUrl = imgElement.src;

          if (dataUrl.includes("img/none.png")) {
            allImagesUploaded = false;
            errorMessages.push(`画像${i + 1}がアップロードされていません`);
          } else {
            if (i % 2 === 0) {
              doc.addImage(dataUrl, "PNG", xOffset, yOffset, postcardWidth, postcardHeight);
            } else {
              yOffset += postcardHeight;
              doc.addImage(dataUrl, "PNG", xOffset, yOffset, postcardWidth, postcardHeight);
              if (i % 2 === 1) {
                yOffset = 10;
                if (i + 1 < imagesToProcess.length) {
                  doc.addPage();
                }
              }
            }
          }
        } else {
          allImagesUploaded = false;
          errorMessages.push(`画像${i + 1}がアップロードされていません`);
        }
      }
    }

    const imagesPerPage = 2;
    for (let i = 0; i < totalImages; i += imagesPerPage) {
      const imagesToProcess = Array.from(imagePreviews).slice(i, i + imagesPerPage);
      await processPage(imagesToProcess, Math.floor(i / imagesPerPage));
    }

    if (!allImagesUploaded) {
      showError();
      generateButton.disabled = false;
      return;
    }

    const finalImage = new Image();
    finalImage.src = "img/stand.png";

    finalImage.onload = () => {
      doc.addPage();
      doc.addImage(finalImage.src, "PNG", 0, 0, 210, 297);

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

      const pdfBlob = doc.output("blob");
      generatedPdfBlob = pdfBlob;

      const viewPdfButton = document.getElementById("viewPdfButton");
      viewPdfButton.style.display = "inline-block";
      viewPdfButton.disabled = false;

      setTimeout(() => generateButton.disabled = false, 1000);
    };

    finalImage.onerror = () => {
      generateButton.disabled = false;
    };
  });

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
