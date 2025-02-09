export let selectedType = 0;
document.getElementById("type1").addEventListener("click", function() {
    selectedType = 1;
    document.querySelector(".typeselect").style.display = "none";
});
document.getElementById("type2").addEventListener("click", function() {
    selectedType = 2;
    document.querySelector(".typeselect").style.display = "none";
});
document.getElementById("type3").addEventListener("click", function() {
    selectedType = 3;
    document.querySelector(".typeselect").style.display = "none";
});
