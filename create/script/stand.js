document.getElementById("viewStandButton").addEventListener("click", async () => {
  const standImage = new Image();
  standImage.src = "frame/stand.png";
  const doc = new jsPDF("p", "mm", "a4");

  standImage.onload = async () => {
      // スタンド画像のサイズ（A4）
      const standImageWidth = 210;
      const standImageHeight = 297;
      
      // 正方形画像のサイズ
      const squareWidth = 24.9;
      const squareHeight = 24.9;
      
      // 開始位置
      const startX = 29.95;
      const startY = 186;
      let squareX = startX;
      let squareY = startY;

      // スタンド画像をPDFに追加
      doc.addImage(standImage.src, "PNG", 0, 0, standImageWidth, standImageHeight);

      for (let i = 1; i <= 12; i++) {
          // ユーザーがアップロードした画像を取得
          const fileInput = document.getElementById(`imageInput${i}`);
          if (!fileInput || !fileInput.files[0]) {
              console.log(`imageInput${i} に画像がありません`);
              continue;
          }

          // 画像を正方形に加工
          const processedDataUrl = await processSquareImage(fileInput.files[0], `create/frame/square/${i}.png`);
          console.log(`画像${i}を処理したデータURL:`, processedDataUrl);

          // PDFに画像を追加
          doc.addImage(processedDataUrl, "PNG", squareX, squareY, squareWidth, squareHeight);
          squareX += squareWidth;

          // 6枚ごとに次の列へ移動
          if (i % 6 === 0) {
              squareX = startX;
              squareY += squareHeight + 34.6;
          }
      }

      // PDFを生成して表示
      const standBlob = doc.output("blob");
      const standUrl = URL.createObjectURL(standBlob);
      window.open(standUrl);
  };

  standImage.onerror = () => {
      console.error("スタンド画像の読み込みに失敗しました。");
  };
});

async function processSquareImage(file, squareFramePath) {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
          const img = new Image();
          img.src = e.target.result;
          img.onload = () => {
              console.log("元画像が読み込まれました", img);

              // 元画像を正方形に切り抜く
              const squareCanvas = document.createElement("canvas");
              const squareCtx = squareCanvas.getContext("2d");
              const size = Math.min(img.width, img.height);
              squareCanvas.width = size;
              squareCanvas.height = size;
              const squareX = (img.width - size) / 2;
              const squareY = (img.height - size) / 2;

              // 画像の描画確認
              squareCtx.drawImage(img, squareX, squareY, size, size, 0, 0, size, size);
              console.log("画像が正方形キャンバスに描画されました");

              // 正方形のフレームを重ねる
              const squareFrameImg = new Image();
              squareFrameImg.src = squareFramePath;
              squareFrameImg.onload = () => {
                  const squareFrameCanvas = document.createElement("canvas");
                  const squareFrameCtx = squareFrameCanvas.getContext("2d");
                  squareFrameCanvas.width = size;
                  squareFrameCanvas.height = size;
                  squareFrameCtx.drawImage(squareFrameImg, 0, 0, size, size);
                  squareCtx.drawImage(squareFrameCanvas, 0, 0, size, size);
                  console.log("フレーム画像が重ねられました");

                  // 正方形画像をリサイズ
                  const squareResizedCanvas = document.createElement("canvas");
                  const squareResizedCtx = squareResizedCanvas.getContext("2d");
                  const resizedSize = 294;
                  squareResizedCanvas.width = resizedSize;
                  squareResizedCanvas.height = resizedSize;
                  squareResizedCtx.drawImage(squareCanvas, 0, 0, size, size, 0, 0, resizedSize, resizedSize);
                  const resizedDataUrl = squareResizedCanvas.toDataURL();

                  // キャンバス削除
                  squareCanvas.remove();
                  squareFrameCanvas.remove();
                  squareResizedCanvas.remove();
                  resolve(resizedDataUrl);
              };

              squareFrameImg.onerror = () => reject(new Error("正方形フレーム画像の読み込みに失敗しました。"));
          };
          img.onerror = () => reject(new Error("画像処理エラーが発生しました。"));
      };
      reader.onerror = () => reject(new Error("画像読み込みエラーが発生しました。"));
      reader.readAsDataURL(file);
  });
}
