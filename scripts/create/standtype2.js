import { fontstype } from "./fontselect.js";
export async function generateStandImage_type2() {
  return new Promise((resolve, reject) => {
    const standCanvas = document.createElement("canvas");
    const standCtx = standCanvas.getContext("2d");
    standCanvas.width = 2895;
    standCanvas.height = 4093;
    const standImage = new Image();
    standImage.src = "/desktopcalendar/frame/stand/stand.png";
    standImage.onload = () => {
      standCtx.drawImage(standImage, 0, 0, standCanvas.width, standCanvas.height);
      resolve();
    };
    standImage.onerror = () => reject(new Error("スタンド画像の読み込みに失敗しました。"));
  });
}
document.addEventListener("DOMContentLoaded", () => {
  const standinput = document.getElementById("standinput");
  if (!standinput) return;
  standinput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const fileReader = new FileReader();
    fileReader.onload = async () => {
      const backImage = new Image();
      backImage.src = fileReader.result;
      backImage.onload = async () => {
        const standCanvas = document.createElement("canvas");
        const standCtx = standCanvas.getContext("2d");
        standCanvas.width = 2895;
        standCanvas.height = 4093;
        const standImage = new Image();
        standImage.src = "/desktopcalendar/frame/stand/stand.png";
        await new Promise((res) => {
          standImage.onload = () => {
            standCtx.drawImage(standImage, 0, 0, standCanvas.width, standCanvas.height);
            res();
          };
          standImage.onerror = () => reject(new Error("スタンド画像の読み込みに失敗しました。"));
        });
        const backWidth = backImage.width;
        const backHeight = backImage.height;
        const aspectRatio = 149.5 / 84.3;
        let cropWidth = backWidth;
        let cropHeight = backHeight;
        if (backWidth / backHeight > aspectRatio) {
          cropWidth = backHeight * aspectRatio;
        } else {
          cropHeight = backWidth / aspectRatio;
        }
        const cropX = (backWidth - cropWidth) / 2;
        const cropY = (backHeight - cropHeight) / 2;
        const imageWidth = 2064;
        const imageHeight = (cropHeight / cropWidth) * imageWidth;
        const startX = 410;
        const startY = 2563;
        standCtx.drawImage(backImage, cropX, cropY, cropWidth, cropHeight, startX, startY, imageWidth, imageHeight);
        const textImg = new Image();
        textImg.src = `/desktopcalendar/frame/stand/2025/${fontstype}/type2.png`;
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
      };
    };
    fileReader.onerror = () => reject(new Error("アップロード画像の読み込みに失敗しました。"));
    fileReader.readAsDataURL(file);
  });
});