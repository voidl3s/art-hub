// ============================================
// WINDOW MANAGEMENT & Z-INDEX STACK
// ============================================

class WindowStack {
  constructor() {
    this.windows = [];
    this.baseZIndex = 6000;
  }

  add(win) {
    this.windows.push(win);
    this.updateZIndices();
  }

  remove(win) {
    this.windows = this.windows.filter(w => w !== win);
    this.updateZIndices();
  }

  bringToFront(win) {
    this.remove(win);
    this.add(win);
  }

  updateZIndices() {
    this.windows.forEach((win, index) => {
      win.style.zIndex = this.baseZIndex + index;
    });
  }
}

const windowStack = new WindowStack();

// ============================================
// DRAG & RESIZE STATE MANAGEMENT
// ============================================

let dragState = null;
let resizeState = null;

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getRandomPosition() {
  const maxX = Math.max(0, window.innerWidth - 400);
  const maxY = Math.max(0, window.innerHeight - 300);
  return {
    x: Math.random() * maxX + 50,
    y: Math.random() * maxY + 50,
  };
}

function cleanupWindowListeners(win, bringToFrontHandler, closeHandler) {
  win.removeEventListener("pointerdown", bringToFrontHandler);
  const closeButton = win.querySelector(".window-close");
  if (closeButton) {
    closeButton.removeEventListener("click", closeHandler);
    closeButton.removeEventListener("keydown", closeHandler);
  }
}

// ============================================
// WINDOW CREATION
// ============================================

function createWindow(imageSrc) {
  const win = document.createElement("div");
  win.classList.add("window");

  const pos = getRandomPosition();
  win.style.top = pos.y + "px";
  win.style.left = pos.x + "px";

  win.setAttribute("role", "dialog");
  win.setAttribute("aria-label", "Image viewer window");

  win.innerHTML = `
    <div class="window-header">
      <span>Image Viewer</span>
      <div class="window-close" tabindex="0" role="button" aria-label="Close window">×</div>
    </div>
    <div class="window-content">
      <img src="${imageSrc}" alt="Displayed artwork">
      <div class="resize resize-br" aria-label="Resize bottom-right"></div>
      <div class="resize resize-bl" aria-label="Resize bottom-left"></div>
      <div class="resize resize-tr" aria-label="Resize top-right"></div>
      <div class="resize resize-tl" aria-label="Resize top-left"></div>
    </div> 
  `;

  document.body.appendChild(win);
  windowStack.add(win);

  // Bring to front handler
  const bringToFront = () => {
    windowStack.bringToFront(win);
  };
  win.addEventListener("pointerdown", bringToFront);

  // Close window handler
  const closeHandler = (e) => {
    if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") {
      return;
    }
    if (e.type === "keydown") {
      e.preventDefault();
    }
    cleanupWindowListeners(win, bringToFront, closeHandler);
    windowStack.remove(win);
    win.remove();
  };

  const closeButton = win.querySelector(".window-close");
  closeButton.addEventListener("click", closeHandler);
  closeButton.addEventListener("keydown", closeHandler);

  // Make window focusable and keyboard-operable
  win.setAttribute('tabindex', '0');
  const keyHandler = (e) => {
    const step = e.shiftKey ? 20 : 10;
    const rect = win.getBoundingClientRect();
    if (e.key === 'Escape') {
      // close
      cleanupWindowListeners(win, bringToFront, closeHandler);
      windowStack.remove(win);
      win.remove();
      return;
    }
    // Move with arrows
    if (e.key === 'ArrowLeft') {
      win.style.left = (rect.left - step) + 'px';
      return;
    }
    if (e.key === 'ArrowRight') {
      win.style.left = (rect.left + step) + 'px';
      return;
    }
    if (e.key === 'ArrowUp') {
      win.style.top = (rect.top - step) + 'px';
      return;
    }
    if (e.key === 'ArrowDown') {
      win.style.top = (rect.top + step) + 'px';
      return;
    }
    // Resize with Shift + arrows
    if (e.shiftKey) {
      const curW = rect.width;
      const curH = rect.height;
      if (e.key === 'ArrowLeft') {
        win.style.width = Math.max(100, curW - step) + 'px';
      }
      if (e.key === 'ArrowRight') {
        win.style.width = (curW + step) + 'px';
      }
      if (e.key === 'ArrowUp') {
        win.style.height = Math.max(80, curH - step) + 'px';
      }
      if (e.key === 'ArrowDown') {
        win.style.height = (curH + step) + 'px';
      }
    }
  };
  win.addEventListener('keydown', keyHandler);
  makeDraggable(win);
  makeResizable(win);
}

// ============================================
// DRAGGABLE FUNCTIONALITY
// ============================================

function makeDraggable(win) {
  const header = win.querySelector(".window-header");

  header.addEventListener("pointerdown", (e) => {
    dragState = {
      window: win,
      offsetX: e.clientX - win.offsetLeft,
      offsetY: e.clientY - win.offsetTop,
    };
  });
}

// ============================================
// RESIZABLE FUNCTIONALITY
// ============================================

function makeResizable(win) {
  const handles = win.querySelectorAll(".resize");
  const minWidth = 200;
  const minHeight = 150;

  handles.forEach((handle) => {
    handle.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = win.getBoundingClientRect();
      resizeState = {
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: rect.width,
        startHeight: rect.height,
        startLeft: rect.left,
        startTop: rect.top,
        window: win,
        minWidth,
        minHeight,
      };
    });
  });
}

// ============================================
// GLOBAL MOUSE MOVEMENT & RESIZE HANDLING
// ============================================

document.addEventListener("pointermove", (e) => {
  // Handle dragging
  if (dragState) {
    const { window: win, offsetX, offsetY } = dragState;
    win.style.left = e.clientX - offsetX + "px";
    win.style.top = e.clientY - offsetY + "px";
  }

  // Handle resizing
  if (resizeState) {
    const {
      handle,
      startX,
      startY,
      startWidth,
      startHeight,
      startLeft,
      startTop,
      window: win,
      minWidth,
      minHeight,
    } = resizeState;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newLeft = startLeft;
    let newTop = startTop;

    if (handle.classList.contains("resize-br")) {
      newWidth = startWidth + deltaX;
      newHeight = startHeight + deltaY;
    } else if (handle.classList.contains("resize-bl")) {
      newWidth = startWidth - deltaX;
      newHeight = startHeight + deltaY;
      newLeft = startLeft + deltaX;
    } else if (handle.classList.contains("resize-tr")) {
      newWidth = startWidth + deltaX;
      newHeight = startHeight - deltaY;
      newTop = startTop + deltaY;
    } else if (handle.classList.contains("resize-tl")) {
      newWidth = startWidth - deltaX;
      newHeight = startHeight - deltaY;
      newLeft = startLeft + deltaX;
      newTop = startTop + deltaY;
    }

    // Apply constraints
    if (newWidth >= minWidth) {
      win.style.width = newWidth + "px";
      win.style.left = newLeft + "px";
    }

    if (newHeight >= minHeight) {
      win.style.height = newHeight + "px";
      win.style.top = newTop + "px";
    }
  }
});

document.addEventListener("pointerup", () => {
  dragState = null;
  resizeState = null;
});

// ============================================
// CLICKABLE IMAGES INITIALIZATION
// ============================================

document.querySelectorAll(".retro-click").forEach((img) => {
  img.addEventListener("click", () => {
    createWindow(img.src);
  });
});

// ============================================
// MUSIC PLAYER
// ============================================

const music = document.getElementById("ambientMusic");
const toggle = document.getElementById("audioToggle");

if (music && toggle) {
  // Set initial volume
  music.volume = 0.2;

  // Update button text based on music state
  function updateButton() {
    if (music.paused) {
      toggle.textContent = "🔇 Music Off";
    } else {
      toggle.textContent = "🔊 Music On";
    }
  }

  // Update button on page load
  updateButton();

  // Toggle music on button click
  toggle.addEventListener("click", () => {
    if (music.paused) {
      music.play().catch(() => {
        console.log(
          "Autoplay blocked. User needs to click to start music."
        );
      });
    } else {
      music.pause();
    }
    updateButton();
  });

  // Update button if audio state changes elsewhere
  music.addEventListener("play", updateButton);
  music.addEventListener("pause", updateButton);
}
//play button video on hover
const hoverButtons = document.querySelectorAll('.hover-button');

hoverButtons.forEach((hoverButton) => {
  hoverButton.addEventListener('mouseenter', () => {
    hoverButton.currentTime = 0; // Start from beginning
    hoverButton.play();
  });

  hoverButton.addEventListener('mouseleave', () => {
    hoverButton.pause();
    hoverButton.currentTime = 0; // Reset to start
  });

  hoverButton.addEventListener('click', () => {
    const target = hoverButton.dataset.href || 'music.html';
    window.location.href = target;
  });
});