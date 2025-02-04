document.addEventListener("DOMContentLoaded", function () {
    let flag = startMonth; // 1月または4月からスタート
    let pre = startMonth;
    let startMonth = 1; // デフォルトは1月開始

    // ページ切り替え関数
    function pagechange(flag, pre) {
        document.getElementById(`input${pre}`).style.display = "none";
        document.getElementById(`input${flag}`).style.display = "block";
        document.getElementById("mouth").innerText = `${flag}月の画像をアップロードしてください。`;

        document.querySelector(".prev-btn").style.display = (flag === startMonth) ? "none" : "inline-block";
        let endMonth = (startMonth === 1) ? 12 : 15;

        // 最後の月の処理
        if (flag === endMonth) {
            document.querySelector(".next-btn").style.display = "none";
            document.querySelector("#tostand").style.display = "inline-block";
        } else {
            document.querySelector(".next-btn").style.display = "inline-block";
            document.querySelector("#tostand").style.display = "none";
        }
    }

    // 次へボタン
    document.querySelector(".next-btn").addEventListener("click", () => {
        if (flag < (startMonth === 1 ? 12 : 15)) {
            pre = flag;
            flag++;
            pagechange(flag, pre);
        }
    });

    // 前へボタン
    document.querySelector(".prev-btn").addEventListener("click", () => {
        if (flag > startMonth) {
            pre = flag;
            flag--;
            pagechange(flag, pre);
        }
    });

    // 1月開始
    document.getElementById("startJan").addEventListener("click", () => {
        startMonth = 1;
        flag = 1;
        pre = 1;
        initializeCalendar();
    });

    // 4月開始
    document.getElementById("startApr").addEventListener("click", () => {
        startMonth = 4;
        flag = 4;
        pre = 4;
        initializeCalendar();
    });

    // カレンダー初期化
    function initializeCalendar() {
        document.getElementById("mouth").style.display = "block";
        document.querySelector(".prev-btn").style.display = "none";
        document.querySelector(".next-btn").style.display = "inline-block";

        // 全ての入力エリアを非表示
        for (let i = 1; i <= 15; i++) {
            let inputDiv = document.getElementById(`input${i}`);
            if (inputDiv) {
                inputDiv.style.display = "none";
            }
        }

        // 最初の月を表示
        document.getElementById(`input${flag}`).style.display = "block";
        pagechange(flag, pre);
    }
});
