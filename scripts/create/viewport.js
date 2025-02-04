var flag = 1;
var pre = 0;
function pagechange(flag, pre) {
    document.getElementById(`input${ pre }`).style.display = "none";
    document.getElementById(`input${ flag }`).style.display = "block";
    document.getElementById("mouth").innerText = flag + "月の画像をアップロードしてください。";
    if (flag === 1) {
        document.querySelector(".prev-btn").style.display = "none";
    } else {
        document.querySelector(".prev-btn").style.display = "inline-block";
    }
    if (flag === 12) {
        document.querySelector(".next-btn").style.display = "none";
        document.querySelector("#tostand").style.display = "inline-block";
    } else {
        document.querySelector(".next-btn").style.display = "inline-block";
        document.querySelector("#tostand").style.display = "none";
    }
}
document.querySelector(".next-btn").addEventListener("click", () => {
    if (flag <= 12) {
        pre = flag;
        flag++;
        pagechange(flag, pre);
    }
});
document.querySelector(".prev-btn").addEventListener("click", () => {
    if (flag >= 1) {
        pre = flag;
        flag--;
        pagechange(flag, pre);
    }
});
document.getElementById("mouth").innerText = flag + "月の画像をアップロードしてください。";