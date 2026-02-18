const music = document.getElementById("ambientMusic");
music.volume = 0.2; // 20% volume
music.play().catch(() => {
    console.log("Autoplay blocked. User needs to interact to start music.");
});