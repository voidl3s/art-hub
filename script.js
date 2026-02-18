const music = document.getElementById("ambientMusic");
music.volume = 0.2; // 20% volume
music.play().catch(() => {
    console.log("Autoplay blocked. User needs to interact to start music.");
});

const music = document.getElementById("ambientMusic");
const toggle = document.getElementById("audioToggle");

// Start music muted until user clicks
music.volume = 0.2;
music.pause(); // pause autoplay until user interacts

toggle.addEventListener("click", () => {
    if (music.paused) {
        music.play();
        toggle.textContent = "🔊 Music On";
    } else {
        music.pause();
        toggle.textContent = "🔇 Music Off";
    }
});