const music = document.getElementById("ambientMusic");
const toggle = document.getElementById("audioToggle");
let zIndexCounter = 6000;

document.querySelectorAll(".retro-click").forEach(img => {
  img.addEventListener("click", () => {
    createWindow(img.src);
  });
});

function createWindow(imageSrc) {

  const win = document.createElement("div");
  win.classList.add("window");
  win.style.top = Math.random() * 200 + 100 + "px";
  win.style.left = Math.random() * 200 + 100 + "px";
  win.style.zIndex = zIndexCounter++;

  win.innerHTML = `
    <div class="window-header">
      <span>Image Viewer</span>
      <div class="window-close">×</div>
    </div>
    <div class="window-content">
      <img src="${imageSrc}">
    </div>
  `;

  document.body.appendChild(win);

  // Bring to front when clicked
  win.addEventListener("mousedown", () => {
    win.style.zIndex = zIndexCounter++;
  });

  // Close button
  win.querySelector(".window-close").addEventListener("click", () => {
    win.remove();
  });

  makeDraggable(win);
}

function makeDraggable(win) {
  const header = win.querySelector(".window-header");

  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  header.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    win.style.left = e.clientX - offsetX + "px";
    win.style.top = e.clientY - offsetY + "px";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}

// Set initial volume
music.volume = 0.2;

// Function to update button text
function updateButton() {
    if (music.paused) {
        toggle.textContent = "🔇 Music Off";
    } else {
        toggle.textContent = "🔊 Music On";
    }
}

//Update button on page load
updateButton();

// Toggle music on button click
toggle.addEventListener("click", () => {
    if (music.paused) {
        music.play().catch(() => {
            console.log("Autoplay blocked. User needs to click to start music.");
        });
    } else {
        music.pause();
    }
    updateButton(); // Immediately update button after click
});

// Optional: update button if the audio state changes elsewhere
music.addEventListener("play", updateButton);
music.addEventListener("pause", updateButton);