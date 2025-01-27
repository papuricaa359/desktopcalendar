const { jsPDF } = window.jspdf;


let currentMonth = 0;
let currentErrorIndex = 0;
let errorMessages = [];
let generatedPdfBlob = null;

function updateMonthVisibility(currentMonth) {

  // 月の表示を更新
  for (let i = 1; i <= 12; i++) {
    const monthInput = document.getElementById(`input${i}`);
    if (monthInput) {
      monthInput.style.display = "none";
    }

    const currentMonthInput = document.getElementById(`input${currentMonth + 1}`);
    if (currentMonthInput) {
      currentMonthInput.style.display = "block";
    }
    if (currentMonth === 0) {
      document.querySelector(".prev-btn").style.display = "none";
    } else {
      document.querySelector(".prev-btn").style.display = "inline-block";
    }
    if (currentMonth === 11) {
      document.querySelector(".next-btn").style.display = "none";
      document.querySelector("#generatePdfButton").style.display = "inline-block";
    } else {
      document.querySelector(".next-btn").style.display = "inline-block";
      document.querySelector("#generatePdfButton").style.display = "none";
    }
  }
}
// 「次へ」ボタンのクリックイベント
document.querySelector(".next-btn").addEventListener("click", () => {
  if (currentMonth < 11) {
    currentMonth++;
    updateMonthVisibility(currentMonth); // 表示を更新
  }
});

// 「前へ」ボタンのクリックイベント
document.querySelector(".prev-btn").addEventListener("click", () => {
  if (currentMonth > 0) {
    currentMonth--;
    updateMonthVisibility(currentMonth); // 表示を更新
  }
});

// 画像を処理してフレームを適用する関数
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
          ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

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

            const imageWidth = window.innerWidth >= 1025 ? '45vw' : '100vw';
            imgElement.style.width = imageWidth;

            document.getElementById(previewId).innerHTML = "";
            document.getElementById(previewId).appendChild(imgElement);

            // メモリ解放
            squareCanvas.remove();
            squareFrameCanvas.remove();
            squareResizedCanvas.remove();
          };

          squareFrameImg.onerror = () => reject(new Error("正方形フレーム画像の読み込みに失敗しました。"));
        };

        frameImg.onerror = () => reject(new Error("フレーム画像の読み込みに失敗しました。"));
      };

      img.onerror = () => reject(new Error("画像処理エラーが発生しました。"));
    };

    reader.onerror = () => reject(new Error("画像読み込みエラーが発生しました。"));
    reader.readAsDataURL(file);
  });
}


// 各月の画像アップロード処理を設定
document.querySelectorAll("[id^='imageInput']").forEach((fileInput, index) => {
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    processImage(
      file,
      `/desktopcalendar/create/frame/2025/type1/${index + 1}.png`,
      `imagePreview${index + 1}`,
      `/desktopcalendar/create/frame/square/${index + 1}.png`,
      `squarePreview${index + 1}`
    );
    
  });
});

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

// PDFを生成
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

// PDF表示
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
  location.href = "/desktopcalendar/";
});

updateMonthVisibility(currentMonth);
