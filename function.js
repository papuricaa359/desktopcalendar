const { jsPDF } = window.jspdf;

async function processImage(file, framePath, previewId) {
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

        ctx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, targetWidth, targetHeight
        );

        const frameImg = new Image();
        frameImg.src = framePath;

        frameImg.onload = () => {
          ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

          const dataUrl = canvas.toDataURL();
          resolve(dataUrl);

          const imgElement = document.createElement("img");
          imgElement.src = dataUrl;
          imgElement.style.width = "50vw";
          imgElement.style.display = "block";

          document.getElementById(previewId).innerHTML = "";
          document.getElementById(previewId).appendChild(imgElement);
        };

        frameImg.onerror = () => {
          alert("フレーム画像の読み込みに失敗しました。");
          reject(new Error("フレーム画像の読み込みに失敗しました。"));
        };
      };

      img.onerror = () => {
        alert("アップロードされた画像の処理中にエラーが発生しました。");
        reject(new Error("アップロードされた画像の処理中にエラーが発生しました。"));
      };
    };

    reader.onerror = () => {
      alert("画像の読み込みに失敗しました。");
      reject(new Error("画像の読み込みに失敗しました。"));
    };

    reader.readAsDataURL(file);
  });
}

function handleImageUpload(inputId, framePath, previewId) {
  const fileInput = document.getElementById(inputId);
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      processImage(file, framePath, previewId).catch((err) => {
        console.error(err.message);
      });
    }
  });
}

for (let i = 1; i <= 12; i++) {
  handleImageUpload(`imageInput${i}`, `frame/${i}.png`, `imagePreview${i}`);
}

let currentErrorIndex = 0;
let errorMessages = [];

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

function closeErrorBox() {
  const errorBox = document.getElementById("error-box");
  const overlay = document.getElementById("overlay");
  overlay.style.display = "none";
  errorBox.style.display = "none";

  currentErrorIndex++;
  if (currentErrorIndex < errorMessages.length) {
    showError();
  }
}

document.getElementById("generatePdfButton").addEventListener("click", () => {
  const generateButton = document.getElementById("generatePdfButton");
  generateButton.disabled = true;

  const doc = new jsPDF("p", "mm", "a4");
  const postcardWidth = 148;
  const postcardHeight = 100;
  let xOffset = 10;
  let yOffset = 10;

  const imagePreviews = document.querySelectorAll("[id^='imagePreview']");
  const totalImages = imagePreviews.length;
  let allImagesUploaded = true;
  errorMessages = [];

  imagePreviews.forEach((preview, index) => {
    const imgElement = preview.querySelector("img");
    if (imgElement) {
      const dataUrl = imgElement.src;
      if (index % 2 === 0) {
        doc.addImage(dataUrl, "PNG", xOffset, yOffset, postcardWidth, postcardHeight);
      } else {
        yOffset += postcardHeight;
        doc.addImage(dataUrl, "PNG", xOffset, yOffset, postcardWidth, postcardHeight);
        if (index % 2 === 1) {
          yOffset = 10;
          if (index + 1 < totalImages) {
            doc.addPage();
          }
        }
      }
    } else {
      allImagesUploaded = false;
      errorMessages.push(`画像${index + 1}がアップロードされていません。`);
    }
  });

  if (!allImagesUploaded) {
    showError();
    generateButton.disabled = false;
    return;
  }

  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const pdfWindow = window.open(pdfUrl, "_blank");
  if (pdfWindow) {
    pdfWindow.focus();
  }

  setTimeout(() => {
    generateButton.disabled = false;
  }, 1000);
});
