import { startMonth } from "./yearselect.js";
export async function generateStandImage_type1() {
  return new Promise((resolve, reject) => {
    const standCanvas = document.createElement("canvas");
    const standCtx = standCanvas.getContext("2d");
    standCanvas.width = 2895;
    standCanvas.height = 4093;
    const standImage = new Image();
    standImage.src = "/desktopcalendar/frame/stand/stand.png";
    standImage.onload = async () => {
      standCtx.drawImage(standImage, 0, 0, standCanvas.width, standCanvas.height);
      const squareWidth = 344;
      const squareHeight = 344;
      const startX = 410;
      const startY = 2563;
      let squareX = startX;
      let squareY = startY;
      let count = 0;
      const startIdx = startMonth === 1 ? 1 : 4;
      const endIdx = startMonth === 1 ? 12 : 15;
      for (let i = startIdx; i <= endIdx; i++) {
        const fileInput = document.getElementById(`imageInput${i}`);
        if (!fileInput || !fileInput.files[0]) continue;
        const processedDataUrl = await processSquareImage(fileInput.files[0], `/desktopcalendar/frame/stand/type1/${i}.png`);
        const squareImg = new Image();
        squareImg.src = processedDataUrl;
        await new Promise((res) => {
          squareImg.onload = () => {
            standCtx.drawImage(squareImg, squareX, squareY, squareWidth, squareHeight);
            res();
          };
        });
        count++;
        squareX += squareWidth;
        if (count % 6 === 0) {
          squareX = startX;
          squareY += squareHeight + 476.7;
        }
      }
      const textImg = new Image();
      textImg.src = "/desktopcalendar/frame/stand/2025/type1.png";
      await new Promise((res) => {
        textImg.onload = () => {
          const textWidth = 2064;
          const textHeight = (textImg.height / textImg.width) * textWidth;
          standCtx.drawImage(textImg, startX, startY, textWidth, textHeight);
          res();
        };
        textImg.onerror = () => reject(new Error("テキスト画像の読み込みに失敗しました。"));
      });
      const standDataUrl = standCanvas.toDataURL("image/jpeg", 1.0);
      const standViewImg = document.getElementById("standview");
      if (standViewImg) {
        standViewImg.src = standDataUrl;
      }
      resolve(standDataUrl);
    };
    standImage.onerror = () => reject(new Error("スタンド画像の読み込みに失敗しました。"));
  });
}
async function processSquareImage(file, squareFramePath) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = async () => {
        const squareCanvas = document.createElement("canvas");
        const squareCtx = squareCanvas.getContext("2d");
        const size = Math.min(img.width, img.height);
        squareCanvas.width = size;
        squareCanvas.height = size;
        const squareX = (img.width - size) / 2;
        const squareY = (img.height - size) / 2;
        squareCtx.drawImage(img, squareX, squareY, size, size, 0, 0, size, size);
        const frameImg = new Image();
        frameImg.src = squareFramePath;
        frameImg.onload = () => {
          squareCtx.drawImage(frameImg, 0, 0, size, size);
          const squareResizedCanvas = document.createElement("canvas");
          const squareResizedCtx = squareResizedCanvas.getContext("2d");
          const resizedSize = 396;
          squareResizedCanvas.width = resizedSize;
          squareResizedCanvas.height = resizedSize;
          squareResizedCtx.drawImage(squareCanvas, 0, 0, size, size, 0, 0, resizedSize, resizedSize);
          const resizedDataUrl = squareResizedCanvas.toDataURL("image/jpeg", 1.0);
          resolve(resizedDataUrl);
        };
        frameImg.onerror = () => reject(new Error("フレーム画像の読み込みエラーが発生しました。"));
      };
      img.onerror = () => reject(new Error("画像処理エラーが発生しました。"));
    };
    reader.onerror = () => reject(new Error("画像読み込みエラーが発生しました。"));
    reader.readAsDataURL(file);
  });
}