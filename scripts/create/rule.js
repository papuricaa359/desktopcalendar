document.getElementById("agree").addEventListener("click", function () {
    let rule = document.getElementById("rule");
    rule.style.display = "none";
});
document.getElementById("disagree").addEventListener("click", function () {
    location.href = "/desktopcalendar/";
});
function openTypeSelect() {
    document.getElementById('typeselect').style.display = 'flex';
}
