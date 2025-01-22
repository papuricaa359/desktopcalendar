document.addEventListener("DOMContentLoaded", () => {
  const { jsPDF } = window.jspdf;
  let currentMonthIndex = 0;
  let generatedPdfBlob = null;
  const imageData = {};

  // ハガキサイズの定数
  const POSTCARD_WIDTH = 148; // mm
  const POSTCARD_HEIGHT = 100; // mm
  const PAGE_MARGIN_X = 10; // mm
  const PAGE_MARGIN_Y = 10; // mm

  // 月の表示を切り替える
  const updateMonthVisibility = () => {
    document.querySelectorAll(".upload-container").forEach((container, index) => {
      container.style.display = index === currentMonthIndex ? "block" : "none";
    });
    document.querySelector(".prev-btn").style.display = currentMonthIndex === 0 ? "none" : "inline-block";
    document.querySelector(".next-btn").style.display = currentMonthIndex === 11 ? "none" : "inline-block";
    document.querySelector("#generatePdfButton").style.display = currentMonthIndex === 11 ? "inline-block" : "none";
  };

  // ファイルアップロード処理
  const handleImageUpload = (inputId, framePath, previewId) => {
    const fileInput = document.getElementById(inputId);
    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const { normalDataUrl } = await processImage(file, framePath);
          document.getElementById(previewId).innerHTML = `<img src="${normalDataUrl}" style="width: 50vw;">`;
          imageData[inputId] = { normalDataUrl };
        } catch (err) {
          console.error(err.message);
        }
      }
    });
  };

  // 画像処理関数
  const processImage = async (file, framePath) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const targetHeight = 1741; // px
          const targetWidth = (targetHeight * 3) / 4; // ハガキサイズ比率 (3:4)
          const cropSize = Math.min(img.width, img.height);
          const cropX = (img.width - cropSize) / 2;
          const cropY = (img.height - cropSize) / 2;

          canvas.width = 2577; // px
          canvas.height = 1741; // px
          ctx.drawImage(img, cropX, cropY, cropSize, cropSize, 0, 0, targetWidth, targetHeight);

          const frameImg = new Image();
          frameImg.src = framePath;
          frameImg.onload = () => {
            ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
            resolve({ normalDataUrl: canvas.toDataURL() });
          };
        };
      };
      reader.onerror = () => reject(new Error("画像読み込みエラー"));
      reader.readAsDataURL(file);
    });
  };

  // PDF生成処理
  document.getElementById("generatePdfButton").addEventListener("click", () => {
    const doc = new jsPDF("p", "mm", "a4");
    let xOffset = PAGE_MARGIN_X;
    let yOffset = PAGE_MARGIN_Y;

    const errorMessages = [];
    const allPreviews = document.querySelectorAll("[id^='imagePreview']");
    allPreviews.forEach((preview, index) => {
      const imgElement = preview.querySelector("img");
      if (!imgElement || imgElement.src.includes("img/none.png")) {
        errorMessages.push(`画像${index + 1}がアップロードされていません`);
      } else {
        const dataUrl = imgElement.src;
        doc.addImage(dataUrl, "PNG", xOffset, yOffset, POSTCARD_WIDTH, POSTCARD_HEIGHT);

        // 2枚目はページを切り替える
        if (index % 2 === 1) {
          yOffset = PAGE_MARGIN_Y;
          doc.addPage();
        } else {
          yOffset += POSTCARD_HEIGHT;
        }
      }
    });

    // エラー処理
    if (errorMessages.length > 0) {
      showErrorMessages(errorMessages);
      return;
    }

    // PDF生成完了
    generatedPdfBlob = doc.output("blob");
    document.getElementById("viewPdfButton").style.display = "inline-block";
  });

  // PDFプレビュー処理
  document.getElementById("viewPdfButton").addEventListener("click", () => {
    if (generatedPdfBlob) {
      const url = URL.createObjectURL(generatedPdfBlob);
      window.open(url, "_blank");
    } else {
      alert("PDFがまだ生成されていません");
    }
  });

  // エラーメッセージ表示
  const showErrorMessages = (messages) => {
    const overlay = document.getElementById("overlay");
    const errorBox = document.getElementById("error-box");
    const errMessage = document.getElementById("errmesse");

    errMessage.textContent = messages.join("\n");
    overlay.style.display = "block";
    errorBox.style.display = "flex";
  };

  window.closeErrorBox = () => {
    const overlay = document.getElementById("overlay");
    const errorBox = document.getElementById("error-box");
    overlay.style.display = "none";
    errorBox.style.display = "none";
  };

  // 初期化
  updateMonthVisibility();
  for (let i = 1; i <= 12; i++) {
    handleImageUpload(`imageInput${i}`, `frame/${i}.png`, `imagePreview${i}`);
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
});
