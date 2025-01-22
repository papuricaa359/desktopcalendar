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

          // 正方形画像の作成
          const squareCanvas = document.createElement("canvas");
          const squareCtx = squareCanvas.getContext("2d");
          const size = Math.min(img.width, img.height);
          squareCanvas.width = size;
          squareCanvas.height = size;

          const squareX = (img.width - size) / 2;
          const squareY = (img.height - size) / 2;

          squareCtx.drawImage(img, squareX, squareY, size, size, 0, 0, size, size);

          // 正方形のフレーム画像を読み込んで正方形キャンバスに描画
          const squareFrameImg = new Image();
          squareFrameImg.src = squareFramePath;

          squareFrameImg.onload = () => {
            squareCtx.drawImage(squareFrameImg, 0, 0, squareCanvas.width, squareCanvas.height);
            const squareDataUrl = squareCanvas.toDataURL();

            // 通常のフレーム画像を読み込み
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
              document.getElementById(previewId).innerHTML = "";
              document.getElementById(previewId).appendChild(imgElement);

              // 正方形のプレビュー画像を表示
              const squareImgElement = document.getElementById(squarePreviewId);
              squareImgElement.src = squareDataUrl;
            };

            frameImg.onerror = () => {
              console.error("フレーム画像の読み込みに失敗:", framePath);
              reject(new Error("フレーム画像の読み込みに失敗"));
            };
          };

          squareFrameImg.onerror = () => {
            console.error("正方形フレーム画像の読み込みに失敗:", squareFramePath);
            reject(new Error("正方形フレーム画像の読み込みに失敗"));
          };
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

    const doc = new jsPDF("p", "mm", "a4");
    const postcardWidth = 148;
    const postcardHeight = 100;
    let xOffset = 10;
    let yOffset = 10;

    const imagePreviews = document.querySelectorAll("[id^='imagePreview']");
    const totalImages = imagePreviews.length;
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
          doc.addImage(dataUrl, "PNG", xOffset, yOffset, postcardWidth, postcardHeight);
          yOffset += postcardHeight + 10;
          if ((index + 1) % 2 === 0) {
            yOffset = 10;
            xOffset += postcardWidth + 10;
            if (index + 1 < imagePreviews.length) {
              doc.addPage();
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

/*
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
*/
      // PDFを生成
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      generatedPdfBlob = pdfBlob;
      document.getElementById("createing").style.display = "none";

      // PDF表示ボタンを表示
      const viewPdfButton = document.getElementById("viewPdfButton");
      viewPdfButton.style.display = "inline-block";
      viewPdfButton.onclick = () => {
        const pdfWindow = window.open(pdfUrl);
        if (!pdfWindow) {
          alert("ポップアップブロックが有効になっています。PDFを表示するには、ポップアップを許可してください。");
        }
      };
    };
  });

  updateMonthVisibility();
});
