document.addEventListener("DOMContentLoaded", function () {
    let currentMonthIndex = 0;

    function updateMonthVisibility() {
        document.querySelectorAll(".upload-container").forEach(function (container, index) {
            container.style.display = (index === currentMonthIndex) ? "block" : "none";
        });

        if (currentMonthIndex === 0) {
            document.querySelector(".prev-btn").style.display = "none";
        } else {
            document.querySelector(".prev-btn").style.display = "inline-block";
        }

        if (currentMonthIndex === 11) {
            document.querySelector(".next-btn").style.display = "none";
            document.querySelector("#generatePdfButton").style.display = "inline-block";
        } else {
            document.querySelector(".next-btn").style.display = "inline-block";
            document.querySelector("#generatePdfButton").style.display = "none";
        }
    }

    updateMonthVisibility();

    document.querySelector(".next-btn").addEventListener("click", function () {
        if (currentMonthIndex < 11) {
            currentMonthIndex++;
            updateMonthVisibility();
        }
    });

    document.querySelector(".prev-btn").addEventListener("click", function () {
        if (currentMonthIndex > 0) {
            currentMonthIndex--;
            updateMonthVisibility();
        }
    });
});
