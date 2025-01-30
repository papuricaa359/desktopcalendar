const { jsPDF } = window.jspdf;
document.getElementById("StandButton").addEventListener("click", async () => {
    const standImage = new Image();
    standImage.src = "/desktopcalendar/frame/stand.png";
    const doc = new jsPDF("p", "mm", "a4");
    standImage.onload = async () => {
        const standImageWidth = 210;
        const standImageHeight = 297;
        const squareWidth = 24.9;
        const squareHeight = 24.9;
        const startX = 29.95;
        const startY = 186;
        let squareX = startX;
        let squareY = startY;
        doc.addImage(standImage.src, "PNG", 0, 0, standImageWidth, standImageHeight);
        for (let i = 1; i <= 12; i++) {
            const fileInput = document.getElementById(`imageInput${i}`);
            if (!fileInput || !fileInput.files[0]) {
                console.log(`imageInput${i} に画像がありません`);
                continue;
            }
            const processedDataUrl = await processSquareImage(fileInput.files[0], `/frame/square/${i}.png`);
            doc.addImage(processedDataUrl, "PNG", squareX, squareY, squareWidth, squareHeight);
            squareX += squareWidth;
            if (i % 6 === 0) {
                squareX = startX;
                squareY += squareHeight + 34.6;
            }
        }
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
