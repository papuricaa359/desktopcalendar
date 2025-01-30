export async function processImage_type3(file, framePath, previewId) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const targetHeight = 1741;
                const targetWidth = (targetHeight * 14.8) / 10;
                let cropWidth, cropHeight;
                if (img.width / img.height > 14.8 / 10) {
                    cropHeight = img.height;
                    cropWidth = cropHeight * 14.8 / 10;
                } else {
                    cropWidth = img.width;
                    cropHeight = cropWidth * 10 / 14.8;
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

                    const imgElement = document.createElement("img");
                    imgElement.src = dataUrl;
                    imgElement.style.width = window.innerWidth >= 1025 ? '45vw' : '100vw';

                    document.getElementById(previewId).innerHTML = "";
                    document.getElementById(previewId).appendChild(imgElement);
                    canvas.remove();
                };
                frameImg.onerror = () => reject(new Error("フレーム画像の読み込みに失敗しました。"));
            };
            img.onerror = () => reject(new Error("画像処理エラーが発生しました。"));
        };
        reader.onerror = () => reject(new Error("画像読み込みエラーが発生しました。"));
        reader.readAsDataURL(file);
    });
}
