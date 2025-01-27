let type = 1;
function removeTypeScripts() {
    const type1Script = document.querySelector('script[src="script/type1.js"]');
    const type2Script = document.querySelector('script[src="script/type2.js"]');
    if (type1Script) type1Script.remove();
    if (type2Script) type2Script.remove();
}

function loadScript(type) {
    removeTypeScripts();

    let scriptTag = document.createElement("script");

    if (type === 1) {
        scriptTag.src = "script/type1.js";
    } else if (type === 2) {
        scriptTag.src = "script/type2.js";
    }

    document.body.appendChild(scriptTag);
}
loadScript(type);
document.getElementById('typeForm').addEventListener('change', (event) => {
    const selectedValue = document.querySelector('input[name="type"]:checked').value;
    type = parseInt(selectedValue);
    loadScript(type);
});
