const { jsPDF } = window.jspdf;

document.addEventListener("DOMContentLoaded", function () {
  let currentMonthIndex = 0;
  let generatedPdfBlob = null;

  // 月ごとの表示・非表示の更新
  function updateMonthVisibility() {
    document.querySelectorAll(".upload-container").forEach((container, index) => {
      container.style.display = index === currentMonthIndex ? "block" : "none";
    });
    document.querySelector(".prev-btn").style.display = currentMonthIndex === 0 ? "none" : "inline-block";
    document.querySelector(".next-btn").style.display = currentMonthIndex === 11 ? "none" : "inline-block";
    document.querySelector("#generatePdfButton").style.display = currentMonthIndex === 11 ? "inline-block" : "none";
  }

  // 「次へ」ボタンのイベントリスナー
  document.querySelector(".next-btn").addEventListener("click", function () {
    if (currentMonthIndex < 11) {
      currentMonthIndex++;
      
        
      }
    updateMonthVisibility();
    }
  });

  // 「戻る」ボタンのイベントリスナー
  document.querySelector(".prev-btn").addEventListener("click", function () {
    if (currentMonthIndex > 0) {
      currentMonthIndex--;
      
      updateMonthVisibility
    }
  });

  // 画像処理
  async function processImage(file, framePath, previewId) {
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
            document.getElementById('none').style.display = "none";
            const imgElement = document.createElement("img");
            imgElement.src = dataUrl;
            imgElement.style.width = "60vw";
            imgElement.style.display = "block";
            document.getElementById(previewId).innerHTML = "";
            document.getElementById(previewId).appendChild(imgElement);
          };

          frameImg.onerror = () => reject(new Error("フレーム画像の読み込みに失敗"));
        };

        img.onerror = () => reject(new Error("画像処理エラー"));
      };

      reader.onerror = () => reject(new Error("画像読み込みエラー"));
      reader.readAsDataURL(file);
    });
  }

  // 画像アップロード処理
  function handleImageUpload(inputId, framePath, previewId) {
    const fileInput = document.getElementById(inputId);
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        processImage(file, framePath, previewId).catch((err) => console.error(err.message));
      }
    });
  }

  // 画像アップロード処理の設定
  for (let i = 1; i <= 12; i++) {
    handleImageUpload(`imageInput${i}`, `frame/${i}.png`, `imagePreview${i}`);
  }

  let currentErrorIndex = 0;
  let errorMessages = [];

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

  // エラーボックスを閉じる
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

  // PDF生成ボタンイベント
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

    // 最後の画像をPDFに追加
    const finalImage = new Image();
    finalImage.src = "stand.png";

    finalImage.onload = () => {
      doc.addPage();
      const finalImageWidth = 210;
      const finalImageHeight = 297;
      doc.addImage(finalImage.src, "PNG", 0, 0, finalImageWidth, finalImageHeight);

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
