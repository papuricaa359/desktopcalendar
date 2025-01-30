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
function setErrorMessages(messages) {
  errorMessages = messages;
  currentErrorIndex = 0;
  if (errorMessages.length > 0) {
    showError();
  }
}
export { setErrorMessages };