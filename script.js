const music = document.getElementById("ambientMusic");
const toggle = document.getElementById("audioToggle");

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