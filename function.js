const { jsPDF } = window.jspdf;

document.addEventListener("DOMContentLoaded", function () {
  let currentMonthIndex = 0;

  // 月ごとの表示を切り替える関数
  function updateMonthVisibility() {
    document.querySelectorAll(".upload-container").forEach((container, index) => {
      container.style.display = index === currentMonthIndex ? "block" : "none";
    });
    document.querySelector(".prev-btn").style.display = currentMonthIndex === 0 ? "none" : "inline-block";
    document.querySelector(".next-btn").style.display = currentMonthIndex === 11 ? "none" : "inline-block";
    document.querySelector("#generatePdfButton").style.display = currentMonthIndex === 11 ? "inline-block" : "none";
  }

  // 「次へ」ボタンのクリックイベント
  document.querySelector(".next-btn").addEventListener("click", () => {
    if (currentMonthIndex < 11) {
      currentMonthIndex++;
      updateMonthVisibility();
    }
  });

  // 「前へ」ボタンのクリックイベント
  document.querySelector(".prev-btn").addEventListener("click", () => {
    if (currentMonthIndex > 0) {
      currentMonthIndex--;
      updateMonthVisibility();
    }
  });

  // 画像処理関数
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

          // フレーム画像をリサイズして重ねる
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

            // 正方形画像の処理
            const squareCanvas = document.createElement("canvas");
            const squareCtx = squareCanvas.getContext("2d");
            const size = Math.min(img.width, img.height);
            squareCanvas.width = size;
            squareCanvas.height = size;

            const squareX = (img.width - size) / 2;
            const squareY = (img.height - size) / 2;

            squareCtx.drawImage(img, squareX, squareY, size, size, 0, 0, size, size);

            // 正方形フレームをリサイズして重ねる
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
              squareImgElement.style.width = '5vw';
              squareImgElement.style.height = '5vw';

              const imgElement = document.createElement("img");
              imgElement.src = dataUrl;
              imgElement.style.width = "50vw";
              document.getElementById(previewId).innerHTML = "";
              document.getElementById(previewId).appendChild(imgElement);
            };

            squareFrameImg.onerror = () => {
              console.error("正方形フレーム画像の読み込みに失敗:", squareFramePath);
              reject(new Error("正方形フレーム画像の読み込みに失敗"));
            };
          };

          frameImg.onerror = () => {
            console.error("フレーム画像の読み込みに失敗:", framePath);
            reject(new Error("フレーム画像の読み込みに失敗"));
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

  // 画像アップロード処理
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

  // PDF生成ボタンの処理
  document.getElementById("generatePdfButton").addEventListener("click", () => {
    const generateButton = document.getElementById("generatePdfButton");
    generateButton.disabled = true;

    const creatingIndicator = document.getElementById("creating");
    creatingIndicator.style.display = "flex";

    const doc = new jsPDF("p", "mm", "a4");
    const postcardWidth = 148;
    const postcardHeight = 100;
    let xOffset = 10;
    let yOffset = 10;
    const margin = 10;

    const imagePreviews = document.querySelectorAll("[id^='imagePreview']");
    let allImagesValid = true;
    let errorMessages = [];

    imagePreviews.forEach((preview, index) => {
      const imgElement = preview.querySelector("img");
      if (!imgElement || imgElement.src.includes("img/none.png")) {
        allImagesValid = false;
        errorMessages.push(`画像${index + 1}が有効ではありません。アップロードされていないか、無効な画像です。`);
      }
    });

    if (!allImagesValid) {
      alert(errorMessages.join("\n"));
      generateButton.disabled = false;
      creatingIndicator.style.display = "none";
      return;
    }

    imagePreviews.forEach((preview, index) => {
      const imgElement = preview.querySelector("img");
      if (imgElement) {
        const dataUrl = imgElement.src;
        doc.addImage(dataUrl, "PNG", xOffset, yOffset, postcardWidth, postcardHeight);
        yOffset += postcardHeight + margin;

        if (yOffset + postcardHeight > 297 - margin) {
          yOffset = margin;
          doc.addPage();
        }
      }
    });

    const finalImage = new Image();
    finalImage.src = "img/stand.png";

    finalImage.onload = () => {
      doc.addPage();
      const finalImageWidth = 210;
      const finalImageHeight = 297;

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
      });

      doc.addImage(finalImage.src, "PNG", 0, 0, finalImageWidth, finalImageHeight);

      const pdfBlob = doc.output("blob");
      generatedPdfBlob = pdfBlob;
      document.getElementById("fin").style.display = "flex";
      creatingIndicator.style.display = "none";
    };

    finalImage.onerror = () => {
      console.error("最終ページの画像読み込みに失敗しました。");
      generateButton.disabled = false;
      creatingIndicator.style.display = "none";
    };
  });

  updateMonthVisibility();
});
