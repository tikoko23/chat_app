const panel = document.getElementById("left-panel");
const svg = document.getElementById("lpanel-menu-svg");
const button = document.getElementById("lpanel-toggle");

let enabled = true;

export function toggleMenu() {
    if (enabled) {
        button.disabled = true;
        
        panel.style.marginRight = `-${panel.clientWidth}px`
        panel.style.transform = "translateX(-100%)";
        
        svg.style.transform = "rotate(90deg)";
    } else {
        button.disabled = true;

        panel.style.removeProperty("margin-right");
        panel.style.removeProperty("transform");

        svg.style.transform = "rotate(0deg)"; 
    
    }

    setTimeout(() => button.disabled = false, 1000);

    enabled = !enabled;
}

button.addEventListener("click", toggleMenu);