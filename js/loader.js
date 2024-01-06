WebFont.load({
    google:
    {
        families: ['Orbitron']
    },
    active: e =>
    {
        //console.log("font loaded!");
        // pre-load the images
        app.loader.
            add([
                "images/Spaceship.png",
                "images/explosions.png",
                "images/Defense-Drone.png",
                "images/Alien-Crasher.png",
                "images/Alien-Phaser.png",
                "images/Alien-Chaser.png",
                "images/Health-Up.png",
                "images/Bullet-Up.png",
                "images/Reload-Up.png",
                "images/Earth.png"
            ]);
        //app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
        app.loader.onComplete.add(setup);
        app.loader.load();
    }
});