export async function generateStandImage_type1() {
  return new Promise((resolve, reject) => {
    const standCanvas = document.createElement("canvas");
    const standCtx = standCanvas.getContext("2d");
    standCanvas.width = 1654;
    standCanvas.height = 2339;
    const standImage = new Image();
    standImage.src = "/desktopcalendar/frame/stand/stand.png";
    
    standImage.onload = async () => {
      standCtx.drawImage(standImage, 0, 0, standCanvas.width, standCanvas.height);
      const squareWidth = 196.2;
      const squareHeight = 196.2;
      const startX = 235.2;
      const startY = 1465;
      let squareX = startX;
      let squareY = startY;
    
      for (let i = 1; i <= 12; i++) {
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
    
        squareX += squareWidth;
        if (i % 6 === 0) {
          squareX = startX;
          squareY += squareHeight + 272.6;
        }
      }

      const textImg = new Image();
      textImg.src = "/desktopcalendar/frame/stand/text/standtype1text.png";

      await new Promise((res, reject) => {
        textImg.onload = () => {
          const textWidth = 1178;
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
