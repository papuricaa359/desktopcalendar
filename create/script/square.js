async function processSquareImage(file, squareFramePath, squarePreviewId) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
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
  
            squareCanvas.remove();
            squareFrameCanvas.remove();
            squareResizedCanvas.remove();
            resolve();
          };
  
          squareFrameImg.onerror = () => reject(new Error("正方形フレーム画像の読み込みに失敗しました。"));
        };
        img.onerror = () => reject(new Error("画像処理エラーが発生しました。"));
      };
      reader.onerror = () => reject(new Error("画像読み込みエラーが発生しました。"));
      reader.readAsDataURL(file);
    });
  }
  
  document.querySelectorAll("[id^='imageInput']").forEach((fileInput, index) => {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      processSquareImage(
        file,
        `/create/frame/square/${index + 1}.png`,
        `squarePreview${index + 1}`
      );
    });
  });
  