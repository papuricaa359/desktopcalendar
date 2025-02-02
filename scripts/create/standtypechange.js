import { setErrorMessages } from "./error.js";
import { generateStandImage_type1 } from "./standtype1.js";
import { generateStandImage_type2 } from "./standtype2.js";
const standConfirmButton = document.querySelector(".standconfirm");
const standshow = document.querySelector(".standshow");
standConfirmButton.addEventListener("click", () => {
    const selectedStandType = document.querySelector("input[name='standtype']:checked").value;
    if (selectedStandType === "1") {
        generateStandImage_type1();
    } else if (selectedStandType === "2") {
        generateStandImage_type2();
    }
    if (standshow) {
        standshow.style.display = "flex";
    }
});
document.querySelector("#tostand").addEventListener("click", () => {
    const tostand = document.getElementById("tostand");
    let errorMessages = [];
    const imagePreviews = document.querySelectorAll("[id^='imagePreview']");
  
    imagePreviews.forEach((preview, index) => {
      const imgElement = preview.querySelector("img");
      if (!imgElement || imgElement.src.includes("images/none.webp")) {
        errorMessages.push(`${index + 1}月がアップロードされていません。`);
      }
    });
  
    if (errorMessages.length > 0) {
      setErrorMessages(errorMessages);
      tostand.disabled = false;
      return;
    }
    document.getElementById("input12").style.display = "none";
    document.getElementById("standtypeselect").style.display = "flex";
    document.querySelector("header").style.display = "none";
    document.querySelector(".viewbutton").style.display = "none";
});
document.querySelector(".standconfirm").addEventListener("click", () => {
    document.getElementById("standtypeselect").style.display = "none";
    document.querySelector(".standshow").style.display = "flex";
});