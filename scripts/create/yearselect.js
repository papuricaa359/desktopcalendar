export let startMonth = 1;
export function setStartMonth(value) {
    startMonth = value;
}
document.getElementById("2025startJan").addEventListener("click", function() {
    document.querySelector(".yearselect").style.display = "none";
});

document.getElementById("2025startApr").addEventListener("click", function() {
    document.querySelector(".yearselect").style.display = "none";
});
