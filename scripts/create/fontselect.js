export let fontstype = null;
document.getElementById("font1").addEventListener("click", function() {
    fontstype = "fonts1";
    document.querySelector(".fontselect").style.display = "none";
    document.querySelector(".typeselect").style.display = "flex";
});
document.getElementById("font2").addEventListener("click", function() {
    fontstype = "fonts2";
    document.querySelector(".fontselect").style.display = "none";
    document.querySelector(".typeselect").style.display = "flex";
});
