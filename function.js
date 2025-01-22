const { jsPDF } = window.jspdf;

document.addEventListener("DOMContentLoaded", function () {
  let currentMonthIndex = 0;

  // 現在の月インデックスに基づいて月の表示を更新
  function updateMonthVisibility() {
    document.querySelectorAll(".upload-container").forEach((container, index) => {
      container.style.display = index === currentMonthIndex ? "block" : "none";
    });
    document.querySelector(".prev-btn").style.display = currentMonthIndex === 0 ? "none" : "inline-block";
    document.querySelector(".next-btn").style.display = currentMonthIndex === 11 ? "none" : "inline-block";
    document.querySelector("#generatePdfButton").style.display = currentMonthIndex === 11 ? "inline-block" : "none";
  }

  // 次の月と前の月のボタンの動作
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

  // 画像を処理する関数
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

        // 正方形の画像を作成
        const squareCanvas = document.createElement("canvas");
        const squareCtx = squareCanvas.getContext("2d");
        const size = Math.min(img.width, img.height);  // 最小値を基準に正方形を作成
        squareCanvas.width = size;
        squareCanvas.height = size;

        const squareX = (img.width - size) / 2;
        const squareY = (img.height - size) / 2;

        squareCtx.drawImage(img, squareX, squareY, size, size, 0, 0, size, size);

        // 正方形フレーム画像を読み込んで正方形キャンバスに描画
        const squareFrameImg = new Image();
        squareFrameImg.src = squareFramePath;

        squareFrameImg.onload = () => {
          squareCtx.drawImage(squareFrameImg, 0, 0, squareCanvas.width, squareCanvas.height);
          const squareDataUrl = squareCanvas.toDataURL();

          // 通常のフレーム画像を読み込んで描画
          const frameImg = new Image();
          frameImg.src = framePath;

          frameImg.onload = () => {
            ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL();
            resolve(dataUrl);

            // 正方形プレビュー画像を表示 (リサイズを後で適用)
            const squareImgElement = document.getElementById(squarePreviewId);
            squareImgElement.src = squareDataUrl;

            // 画像自体を96pxにリサイズする
            const img = new Image();
            img.src = squareDataUrl;
            img.onload = () => {
              const resizedCanvas = document.createElement("canvas");
              const resizedCtx = resizedCanvas.getContext("2d");

              const resizedSize = 96;  // 96pxにリサイズ
              resizedCanvas.width = resizedSize;
              resizedCanvas.height = resizedSize;

              // 画像をリサイズして新しいキャンバスに描画
              resizedCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, resizedSize, resizedSize);

              // 96pxにリサイズした画像を生成
              const resizedDataUrl = resizedCanvas.toDataURL();

              // 正方形プレビュー画像として表示する
              squareImgElement.src = resizedDataUrl;
              squareImgElement.style.width = '96px';  // プレビューサイズを96pxに変更
              squareImgElement.style.height = '96px';  // プレビューサイズを96pxに変更
            };

            // 通常のプレビュー画像を表示
            const imgElement = document.createElement("img");
            imgElement.src = dataUrl;
            imgElement.style.width = "50vw";  // 必要に応じて変更
            document.getElementById(previewId).innerHTML = "";
            document.getElementById(previewId).appendChild(imgElement);
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



  // 画像アップロードと処理を管理する関数
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

  // 各月ごとの画像アップロードハンドラを設定
  for (let i = 1; i <= 12; i++) {
    handleImageUpload(`imageInput${i}`, `frame/${i}.png`, `imagePreview${i}`, `frame/square/${i}.png`, `squarePreview${i}`);
  }

  let currentErrorIndex = 0;
  let errorMessages = [];

  // エラーメッセージを表示する関数
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

  // エラーボックスを閉じて次のエラーを表示
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

  // PDFを生成するボタンのイベント
  document.getElementById("generatePdfButton").addEventListener("click", () => {
    const generateButton = document.getElementById("generatePdfButton");
    generateButton.disabled = true;

    const creatingIndicator = document.getElementById("creating");
    creatingIndicator.style.display = "flex";  // 生成中のインジケータを表示

    const doc = new jsPDF("p", "mm", "a4");
    const postcardWidth = 148;  // はがきサイズの幅 (mm)
    const postcardHeight = 100;  // はがきサイズの高さ (mm)
    const margin = 10;  // 余白
    let xOffset = margin;
    let yOffset = margin;

    const imagePreviews = document.querySelectorAll("[id^='imagePreview']");
    const squarePreviews = document.querySelectorAll("[id^='squarePreview']");  // 追加
    const totalImages = imagePreviews.length;
    let allImagesUploaded = true;
    errorMessages = [];

    // 画像の存在確認
    imagePreviews.forEach((preview, index) => {
      const imgElement = preview.querySelector("img");
      if (!imgElement) {
        console.error(`画像${index + 1}が無効です`);
        allImagesUploaded = false;
        errorMessages.push(`画像${index + 1}が無効です`);
        return;  // 無効な場合はスキップ
      }
    });

    if (!allImagesUploaded) {
      showError();
      generateButton.disabled = false;
      creatingIndicator.style.display = "none";  // 生成中インジケータを非表示
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
      creatingIndicator.style.display = "none";  // 生成中インジケータを非表示
      return;
    }

    const finalImage = new Image();
    finalImage.src = "img/stand.png";

    finalImage.onload = () => {
      doc.addPage();
      const finalImageWidth = 210;  // A4の幅
      const finalImageHeight = 297;  // A4の高さ
      doc.addImage(finalImage.src, "PNG", 0, 0, finalImageWidth, finalImageHeight);

      // squarePreview画像をstand.pngの上に横並びに表示
      let squareX = 10;  // X座標を開始位置に設定
      let squareY = 10;  // Y座標をスタート位置に設定
      const squareWidth = 96;  // 96pxに設定
      const squareHeight = 96; // 96pxに設定

      // squarePreviewsのすべての画像を処理
      squarePreviews.forEach((preview, index) => {
        const squareImgElement = preview;  // <img>タグ自体を参照

        const squareDataUrl = squareImgElement.src;

        // 正方形画像を追加
        doc.addImage(squareDataUrl, "PNG", squareX, squareY, squareWidth, squareHeight);

        // 次の画像のX座標を更新
        squareX += squareWidth + margin;

        // 横に並べて配置するため、ページを跨がないように制御
        if ((index + 1) % 6 === 0) {  // 1行に6つ並べる場合
          squareX = 10;  // X座標をリセット
          squareY += squareHeight + margin;  // Y座標を下に移動
        }
      });

      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      generatedPdfBlob = pdfBlob;
      document.getElementById("viewPdfButton").style.display = "block";
      creatingIndicator.style.display = "none";  // 生成中インジケータを非表示
    };
  });

  // PDFを表示するボタンのクリックイベントリスナー
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

  // 月の表示を初期化
  updateMonthVisibility();
});
