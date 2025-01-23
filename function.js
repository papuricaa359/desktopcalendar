const { jsPDF } = window.jspdf;

document.addEventListener("DOMContentLoaded", function () {
  let currentMonthIndex = 0;
  let currentErrorIndex = 0;
  let errorMessages = [];

  // 月ごとの表示更新
  function updateMonthVisibility() {
    document.querySelectorAll(".upload-container").forEach((container, index) => {
      container.style.display = index === currentMonthIndex ? "block" : "none";
    });
    document.querySelector(".prev-btn").style.display = currentMonthIndex === 0 ? "none" : "inline-block";
    document.querySelector(".next-btn").style.display = currentMonthIndex === 11 ? "none" : "inline-block";
    document.querySelector("#generatePdfButton").style.display = currentMonthIndex === 11 ? "inline-block" : "none";
  }

  // 「次へ」「前へ」ボタン
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

  // 画像処理
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

          const frameImg = new Image();
          frameImg.src = framePath;

          frameImg.onload = () => {
            const frameWidth = canvas.width;
            const frameHeight = canvas.height;

            const frameCanvas = document.createElement("canvas");
            const frameCtx = frameCanvas.getContext("2d");
            frameCanvas.width = frameWidth;
            frameCanvas.height = frameHeight;

            frameCtx.drawImage(frameImg, 0, 0, frameWidth, frameHeight);

            ctx.drawImage(frameCanvas, 0, 0, frameWidth, frameHeight);

            const dataUrl = canvas.toDataURL();
            resolve(dataUrl);

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
              const squareFrameCanvas = document.createElement("canvas");
              const squareFrameCtx = squareFrameCanvas.getContext("2d");
              squareFrameCanvas.width = size;
              squareFrameCanvas.height = size;

              squareFrameCtx.drawImage(squareFrameImg, 0, 0, size, size);

              squareCtx.drawImage(squareFrameCanvas, 0, 0, size, size);

              const squareResizedCanvas = document.createElement("canvas");
              const squareResizedCtx = squareResizedCanvas.getContext("2d");
              const resizedSize = 294;
              squareResizedCanvas.width = resizedSize;
              squareResizedCanvas.height = resizedSize;

              squareResizedCtx.drawImage(squareCanvas, 0, 0, size, size, 0, 0, resizedSize, resizedSize);

              const resizedDataUrl = squareResizedCanvas.toDataURL();

              const squareImgElement = document.getElementById(squarePreviewId);
              squareImgElement.src = resizedDataUrl;
              squareImgElement.style.width = '4.5vw';

              const imgElement = document.createElement("img");
              imgElement.src = dataUrl;
              imgElement.style.width = "45vw";
              document.getElementById(previewId).innerHTML = "";
              document.getElementById(previewId).appendChild(imgElement);
            };

            squareFrameImg.onerror = () => {
              reject(new Error("正方形フレーム画像の読み込みに失敗"));
            };
          };

          frameImg.onerror = () => {
            reject(new Error("フレーム画像の読み込みに失敗"));
          };
        };

        img.onerror = () => {
          reject(new Error("画像処理エラー"));
        };
      };

      reader.onerror = () => {
        reject(new Error("画像読み込みエラー"));
      };
      reader.readAsDataURL(file);
    });
  }

  // 画像アップロード
  function handleImageUpload(inputId, framePath, previewId, squareFramePath, squarePreviewId) {
    const fileInput = document.getElementById(inputId);
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        processImage(file, framePath, previewId, squareFramePath, squarePreviewId)
          .catch((err) => console.error(err.message));
      }
    });
  }

  for (let i = 1; i <= 12; i++) {
    handleImageUpload(`imageInput${i}`, `frame/${i}.png`, `imagePreview${i}`, `frame/square/${i}.png`, `squarePreview${i}`);
  }

  // エラーメッセージ表示
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

  // PDF生成
  document.getElementById("generatePdfButton").addEventListener("click", () => {
    const generateButton = document.getElementById("generatePdfButton");
    generateButton.disabled = true;

    const creatingIndicator = document.getElementById("creating");
    creatingIndicator.style.display = "block";

    const doc = new jsPDF("p", "mm", "a4");
    const postcardWidth = 148;
    const postcardHeight = 100;
    let xOffset = 10;
    let yOffset = 10;

    const imagePreviews = document.querySelectorAll("[id^='imagePreview']");
    let allImagesUploaded = false;

    imagePreviews.forEach((preview, index) => {
      const imgElement = preview.querySelector("img");
      if (!imgElement) {
        errorMessages.push(`画像${index + 1}がアップロードされていません`);
      } else if (imgElement.src.includes("img/none.png")) {
        errorMessages.push(`画像${index + 1}がアップロードされていません`);
      } else {
        allImagesUploaded = true;
      }
    });

    if (errorMessages.length > 0) {
      showError();
      creatingIndicator.style.display = "none";
      return;
    }

    imagePreviews.forEach((preview, index) => {
      const imgElement = preview.querySelector("img");
      if (imgElement && !imgElement.src.includes("img/none.png")) {
        const dataUrl = imgElement.src;
        doc.addImage(dataUrl, "PNG", xOffset, yOffset, postcardWidth, postcardHeight);
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

        imgElement.remove();
      }
    });


    const pdfBlob = doc.output("blob");
    generatedPdfBlob = pdfBlob;
    document.getElementById("fin").style.display = "block";
    creatingIndicator.style.display = "none";
  });

  //スタンド生成
  document.getElementById("viewStandButton").addEventListener("click", () => {
    const standImage = new Image();
    standImage.src = "img/stand.png";
    const doc = new jsPDF("p", "mm", "a4");
    standImage.onload = () => {
      const standImageWidth = 210;
      const standImageHeight = 297;

      const squareWidth = 24.9;
      const squareHeight = 24.9;
      const startX = 30;
      const startY = 178.67;

      let squareX = startX;
      let squareY = startY;

      const squarePreviews = document.querySelectorAll("[id^='squarePreview']");

      squarePreviews.forEach((preview, index) => {
        const squareImgElement = preview;
        const squareDataUrl = squareImgElement.src;

        doc.addImage(squareDataUrl, "PNG", squareX, squareY, squareWidth, squareHeight);

        squareX += squareWidth;

        if ((index + 1) % 6 === 0) {
          squareX = startX;
          squareY += squareHeight + 34.75;
        }

        squareImgElement.remove();
      });

      doc.addImage(standImage.src, "PNG", 0, 0, standImageWidth, standImageHeight);

      const standBlob = doc.output("blob");
      generatedStandBlob = standBlob;
      const standUrl = URL.createObjectURL(generatedStandBlob);
      const pdfWindow = window.open(standUrl);


    };

    standImage.onerror = () => {
      creatingIndicator.style.display = "none";
    };
  });

  // PDF表示
  document.getElementById("viewPdfButton").addEventListener("click", () => {
    const pdfUrl = URL.createObjectURL(generatedPdfBlob);
    const pdfWindow = window.open(pdfUrl);
  });

  document.getElementById("closebutton").addEventListener("click", () => {
    location.href="/desktopcalendar/";
  });

  updateMonthVisibility();
});
