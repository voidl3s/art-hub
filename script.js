const music = document.getElementById("ambientMusic");
const toggle = document.getElementById("audioToggle");

// Set initial volume
music.volume = 0.2;

// Check if the music is paused on load (e.g., Firefox blocked autoplay)
if (music.paused) {
    toggle.textContent = "🔇 Music Off";
} else {
    toggle.textContent = "🔊 Music On";
}

// Add toggle functionality
toggle.addEventListener("click", () => {
    if (music.paused) {
        music.play().catch(() => {
            console.log("Autoplay blocked. User needs to interact.");
        });
        toggle.textContent = "🔊 Music On";
    } else {
        music.pause();
        toggle.textContent = "🔇 Music Off";
    }
});