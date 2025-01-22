document.addEventListener("DOMContentLoaded", () => {
  const { jsPDF } = window.jspdf;
  let currentMonthIndex = 0;
  let generatedPdfBlob = null;
  const imageData = {};

  // 月の表示を切り替える
  const updateMonthVisibility = () => {
    document.querySelectorAll(".upload-container").forEach((container, index) => {
      container.style.display = index === currentMonthIndex ? "block" : "none";
    });
    document.querySelector(".prev-btn").style.display = currentMonthIndex === 0 ? "none" : "inline-block";
    document.querySelector(".next-btn").style.display = currentMonthIndex === 11 ? "none" : "inline-block";
    document.querySelector("#generatePdfButton").style.display = currentMonthIndex === 11 ? "inline-block" : "none";
  };

  // 画像処理
  const processImage = async (file, framePath, squareFramePath) => {
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
          const cropSize = Math.min(img.width, img.height);
          const cropX = (img.width - cropSize) / 2;
          const cropY = (img.height - cropSize) / 2;

          canvas.width = 2577;
          canvas.height = 1741;
          ctx.drawImage(img, cropX, cropY, cropSize, cropSize, 0, 0, targetWidth, targetHeight);

          const frameImg = new Image();
          frameImg.src = framePath;
          frameImg.onload = () => {
            ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
            const normalDataUrl = canvas.toDataURL();

            // 正方形フレーム画像の描画
            const squareCanvas = document.createElement("canvas");
            const squareCtx = squareCanvas.getContext("2d");
            squareCanvas.width = cropSize;
            squareCanvas.height = cropSize;
            squareCtx.drawImage(img, cropX, cropY, cropSize, cropSize, 0, 0, cropSize, cropSize);

            const squareFrameImg = new Image();
            squareFrameImg.src = squareFramePath;
            squareFrameImg.onload = () => {
              squareCtx.drawImage(squareFrameImg, 0, 0, squareCanvas.width, squareCanvas.height);
              const squareDataUrl = squareCanvas.toDataURL();
              resolve({ normalDataUrl, squareDataUrl });
            };
          };
        };
      };
      reader.onerror = () => reject(new Error("画像読み込みエラー"));
      reader.readAsDataURL(file);
    });
  };

  // ファイルアップロード処理
  const handleImageUpload = (inputId, framePath, squareFramePath, previewId, squarePreviewId) => {
    const fileInput = document.getElementById(inputId);
    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const { normalDataUrl, squareDataUrl } = await processImage(file, framePath, squareFramePath);
          document.getElementById(previewId).innerHTML = `<img src="${normalDataUrl}" style="width: 50vw;">`;
          document.getElementById(squarePreviewId).src = squareDataUrl;
          imageData[inputId] = { normalDataUrl, squareDataUrl };
        } catch (err) {
          console.error(err.message);
        }
      }
    });
  };

  // イベントリスナー設定
  for (let i = 1; i <= 12; i++) {
    handleImageUpload(`imageInput${i}`, `frame/${i}.png`, `frame/square/${i}.png`, `imagePreview${i}`, `squarePreview${i}`);
  }

  // PDF生成
  document.getElementById("generatePdfButton").addEventListener("click", () => {
    const doc = new jsPDF("p", "mm", "a4");
    const postcardWidth = 148;
    const postcardHeight = 100;

    let xOffset = 10;
    let yOffset = 10;

    const missingImages = [];
    for (let i = 1; i <= 12; i++) {
      const imgData = imageData[`imageInput${i}`];
      if (!imgData || !imgData.normalDataUrl) {
        missingImages.push(i);
      } else {
        doc.addImage(imgData.normalDataUrl, "PNG", xOffset, yOffset, postcardWidth, postcardHeight);
        yOffset += postcardHeight;
        if (i % 2 === 0 && i < 12) {
          doc.addPage();
          yOffset = 10;
        }
      }
    }

    if (missingImages.length > 0) {
      alert(`以下の画像が不足しています: ${missingImages.join(", ")}`);
      return;
    }

    const finalImage = new Image();
    finalImage.src = "img/stand.png";
    finalImage.onload = () => {
      doc.addPage();
      doc.addImage(finalImage.src, "PNG", 0, 0, 210, 297);

      let squareX = 30.75;
      let squareY = 212.25;
      const squareSize = 24.66;

      for (let i = 1; i <= 12; i++) {
        const imgData = imageData[`imageInput${i}`];
        if (imgData && imgData.squareDataUrl) {
          doc.addImage(imgData.squareDataUrl, "PNG", squareX, squareY, squareSize, squareSize);
          squareX += squareSize;
          if (i % 6 === 0) {
            squareX = 30.75;
            squareY += squareSize;
          }
        }
      }

      generatedPdfBlob = doc.output("blob");
      document.getElementById("viewPdfButton").style.display = "inline-block";
    };
  });

  // PDF表示
  document.getElementById("viewPdfButton").addEventListener("click", () => {
    if (generatedPdfBlob) {
      const pdfUrl = URL.createObjectURL(generatedPdfBlob);
      window.open(pdfUrl, "_blank");
    } else {
      alert("PDFがまだ生成されていません");
    }
  });

  // 月移動
  document.querySelector(".next-btn").addEventListener("click", () => {
    currentMonthIndex++;
    updateMonthVisibility();
  });
  document.querySelector(".prev-btn").addEventListener("click", () => {
    currentMonthIndex--;
    updateMonthVisibility();
  });

  updateMonthVisibility();
});
