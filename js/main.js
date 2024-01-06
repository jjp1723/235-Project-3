// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application({
    width: 600,
    height: 600
});
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

window.onload = (e) =>
{
    const storedHighScore = localStorage.getItem("highScoreKey");

    if(storedHighScore)
    {
        highScoreField = storedHighScore;
    }
    else
    {
        highScoreField = 0;
    }
};

//LocalStorage Variables for High Score
let highScoreField;
let highScoreKey;

// Aliases
let stage;

// Scene Variables
let startScene;
let gameScene
let gameOverScene;
let controlScene;

// Sound Variables
let shootSound,hitSound,fireballSound,powerUpSound,enemyEscapedSound;

// Label Variables
let scoreLabel,highScoreLabel,lifeLabel,levelLabel,killsLabel,finalLevelLabel,finalKillsLabel,timeLabel,gameOverScoreLabel;

// Key Input Variables
let keys = {};
let keysDiv = document.querySelector("#keys");

// Game Variables
let ship
let aliens = [];
let bullets = [];
let healthUps = [];
let reloadUps = [];
let bulletUps = [];
let explosions = [];
let explosionTextures;
let score = 0;
let life = 100;
let kills = 0;
let levelNum = 1;
let paused = true;
let cooldown = 0;
let coolTime = 14;
let bulletCount = 1;
let levelTime = 750;
let seconds = levelTime * 0.2;



function setup()
{
	stage = app.stage;
	// #1 - Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

	// #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

	// #3 - Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    // #4 - Create the `controls` scene and make it invisible
    controlScene = new PIXI.Container();
    controlScene.visible = false;
    stage.addChild(controlScene);

	// #5 - Create labels for all 4 scenes
    createLabelsAndButtons();
    
	// #6 - Create ship
    ship = new Ship();
    gameScene.addChild(ship);

    // #7 - Load Sounds
    shootSound = new Howl({
        src: ['sounds/new-shoot-quiet.mp3']
    });

    hitSound = new Howl({
        src: ['sounds/impact-hit-cut.mp3']
    });

    fireballSound = new Howl({
        src: ['sounds/futuristic-explosion-cut-quiet.mp3']
    });
    
    powerUpSound = new Howl({
        src: ['sounds/power-up-quiet.mp3']
    });
    
    enemyEscapedSound = new Howl({
        src: ['sounds/enemy-escaped.mp3']
    });
	
    // #8 - Load sprite sheet
    explosionTextures = loadSpriteSheet();

    // #9 - Keyboard event handlers
    window.addEventListener("keydown", keysDown);
    window.addEventListener("keyup", keysUp);
		
    // #10 - Start update loop
    app.ticker.add(gameLoop);
}



function keysDown(e) {
    //console.log(e.keyCode);
    keys[e.keyCode] = true;
}



function keysUp(e) {
    //console.log(e.keyCode);
    keys[e.keyCode] = false;
}



function createLabelsAndButtons()
{
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 20,
        fontFamily: "Orbitron"
    });

    // 1 - Set up "startScene"

    // 1A - Make the top start label
    let startLabel1 = new PIXI.Text("Alien Assault!");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 50,
        fontFamily: "Orbitron",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel1.x = 100;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    // 1B - Make the middle start label
    let startLabel2 = new PIXI.Text("Stop The Invaders!");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 24,
        fontFamily: "Orbitron",
        fontStyle: "italic",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel2.x = 160;
    startLabel2.y = 200;
    startScene.addChild(startLabel2);

    // 1C - Make the high score label
    highScoreLabel = new PIXI.Text();
    highScoreLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 30,
        fontFamily: "Orbitron",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    highScoreLabel.x = 130;
    highScoreLabel.y = sceneHeight - 200;
    startScene.addChild(highScoreLabel);
    checkHighScore();

    // 1D - Make the start game button
    let startButton = new PIXI.Text("Start");
    startButton.style = buttonStyle;
    startButton.x = 140;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup",startGame); // startGame is a function reference
    startButton.on('pointerover',e=>e.target.alpha = 0.7); //Concise arrow function with no brackets
    startButton.on('pointerout',e=>e.currentTarget.alpha = 1.0); // Ditto
    startScene.addChild(startButton);

    // 1E - Make the controls button
    let controlsButton = new PIXI.Text("Controls + Tips");
    controlsButton.style = buttonStyle;
    controlsButton.x = 300;
    controlsButton.y = sceneHeight - 100;
    controlsButton.interactive = true;
    controlsButton.buttonMode = true;
    controlsButton.on("pointerup",controlMenu); // controlMenu is a function reference
    controlsButton.on('pointerover',e=>e.target.alpha = 0.7); //Concise arrow function with no brackets
    controlsButton.on('pointerout',e=>e.currentTarget.alpha = 1.0); // Ditto
    startScene.addChild(controlsButton);

    // 1F - Add the ship sprite
    let shipSprite = new Ship();
    shipSprite.x = 300;
    shipSprite.y = 350;
    shipSprite.scale.set(1);
    startScene.addChild(shipSprite);

    // 1G - Add the alien sprite
    let alienSprite = new Alien();
    alienSprite.x = 300;
    alienSprite.y = 300;
    alienSprite.scale.set(1);
    startScene.addChild(alienSprite);

    // 2 - Set up "gameScene"
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 16,
        fontFamily: "Orbitron",
        stroke: 0xFF0000,
        strokeThickness: 4
    });

    // 2A - Make Planet Sprite
    let planet = new Planet("images/Earth.png");
    planet.x = sceneWidth / 2;
    planet.y = sceneHeight * 1.2;
    gameScene.addChild(planet);

    // 2B - Make a level label
    levelLabel = new PIXI.Text();
    levelLabel.style = textStyle;
    levelLabel.x = 5;
    levelLabel.y = 5;
    gameScene.addChild(levelLabel);
    displayLevel();

    // 2C - Make life label
    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 5;
    lifeLabel.y = 26;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);

    // 2D - Make a kills label
    killsLabel = new PIXI.Text();
    killsLabel.style = textStyle;
    killsLabel.x = 5;
    killsLabel.y = 47;
    gameScene.addChild(killsLabel);
    increaseKillsBy(0);

    // 2E - Make score label
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 5;
    scoreLabel.y = 68;
    gameScene.addChild(scoreLabel);
    calculateScore();

    // 2F - Make time label
    timeLabel = new PIXI.Text();
    timeLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 20,
        fontFamily: "Orbitron",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    timeLabel.x = 170;
    timeLabel.y = 560;
    gameScene.addChild(timeLabel);
    showTime();

    // 3 - Set up `gameOverScene`
    // 3A - Make game over text
    let gameOverText = new PIXI.Text("Game Over!");
    textStyle = new PIXI.TextStyle({
	    fill: 0xFFFFFF,
	    fontSize: 50,
	    fontFamily: "Orbitron",
	    stroke: 0xFF0000,
	    strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = 140;
    gameOverText.y = sceneHeight / 2 - 160;
    gameOverScene.addChild(gameOverText);

    // 3B - Make Final Score Text
    gameOverScoreLabel = new PIXI.Text("Your final score: " + score);
    textStyle = new PIXI.TextStyle({
	    fill: 0xFFFFFF,
	    fontSize: 20,
        fontFamily: "Orbitron",
        fontStyle: "italic",
	    stroke: 0xFF0000,
	    strokeThickness: 6
    });
    gameOverScoreLabel.style = textStyle;
    gameOverScoreLabel.x = 180;
    gameOverScoreLabel.y = 300;
    gameOverScene.addChild(gameOverScoreLabel);

    // 3C - Make a final level label
    finalLevelLabel = new PIXI.Text("Final Level: " + levelNum);
    finalLevelLabel.style = textStyle;
    finalLevelLabel.x = 180;
    finalLevelLabel.y = 350;
    gameOverScene.addChild(finalLevelLabel);

    // 3D - Make a kills label
    finalKillsLabel = new PIXI.Text("Final Kills: " + kills);
    finalKillsLabel.style = textStyle;
    finalKillsLabel.x = 180;
    finalKillsLabel.y = 400;
    gameOverScene.addChild(finalKillsLabel);

    // 3E - Make "play again?" button
    let playAgainButton = new PIXI.Text("Play Again");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 150;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup",startGame); // startGame is a function reference
    playAgainButton.on('pointerover',e=>e.target.alpha = 0.7); // concise arrow function with no brackets
    playAgainButton.on('pointerout',e=>e.currentTarget.alpha = 1.0); // ditto
    gameOverScene.addChild(playAgainButton);

    // 3F - Make `Main Menu` button
    let menuButton = new PIXI.Text("Main Menu");
    menuButton.style = buttonStyle;
    menuButton.x = 330;
    menuButton.y = sceneHeight - 100;
    menuButton.interactive = true;
    menuButton.buttonMode = true;
    menuButton.on("pointerup",returnToMenu); // returnToMenu is a function reference
    menuButton.on('pointerover',e=>e.target.alpha = 0.7); // concise arrow function with no brackets
    menuButton.on('pointerout',e=>e.currentTarget.alpha = 1.0); // ditto
    gameOverScene.addChild(menuButton);

    // 4 - Set up `controlScene`
    // 4A - Make movement control label
    let movementLabel = new PIXI.Text("Movement:   W A S D");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 30,
        fontFamily: "Orbitron",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    movementLabel.style = textStyle;
    movementLabel.x = 100;
    movementLabel.y = 100;
    controlScene.addChild(movementLabel);

    // 4B - Make fire control label
    let fireLabel = new PIXI.Text("Fire:                 Spacebar");
    fireLabel.style = textStyle;
    fireLabel.x = 100;
    fireLabel.y = 150;
    controlScene.addChild(fireLabel);

    // 4C - Make Health-Up Sprite and Label
    let healthSprite = new PowerUp("images/Health-Up.png");
    healthSprite.x = 20;
    healthSprite.y = 250;
    controlScene.addChild(healthSprite);

    let healthUpLabel = new PIXI.Text("Health-Ups Increase Your Health")
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 24,
        fontFamily: "Orbitron",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    healthUpLabel.style = textStyle;
    healthUpLabel.x = 70;
    healthUpLabel.y = 250;
    controlScene.addChild(healthUpLabel);

    // 4D - Make Bullet-Up Sprite and Label
    let bulletSprite = new PowerUp("images/Bullet-Up.png");
    bulletSprite.x = 20;
    bulletSprite.y = 300;
    controlScene.addChild(bulletSprite);

    let bulletUpLabel = new PIXI.Text("Bullet-Ups Increase Your Bullet Count")
    bulletUpLabel.style = textStyle;
    bulletUpLabel.x = 70;
    bulletUpLabel.y = 300;
    controlScene.addChild(bulletUpLabel);

    // 4E - Make Reload-Up Sprite and Label
    let reloadSprite = new PowerUp("images/Reload-Up.png");
    reloadSprite.x = 20;
    reloadSprite.y = 350;
    controlScene.addChild(reloadSprite);

    let reloadUpLabel = new PIXI.Text("Reload-Ups Increase Your Fire Rate")
    reloadUpLabel.style = textStyle;
    reloadUpLabel.x = 70;
    reloadUpLabel.y = 350;
    controlScene.addChild(reloadUpLabel);

    // 4F - Make Top Label
    let tipLabel = new PIXI.Text("Don't let the aliens hit you or reach Earth.\nIf they do you'll lose health!")
    tipLabel.style = textStyle;
    tipLabel.x = 30;
    tipLabel.y = 440;
    controlScene.addChild(tipLabel);

    // 4E - Make `Return to Menu` button
    let menuReturnButton = new PIXI.Text("Return to Menu");
    menuReturnButton.style = buttonStyle;
    menuReturnButton.x = 200;
    menuReturnButton.y = sceneHeight - 50;
    menuReturnButton.interactive = true;
    menuReturnButton.buttonMode = true;
    menuReturnButton.on("pointerup",returnToMenu); // returnToMenu is a function reference
    menuReturnButton.on('pointerover',e=>e.target.alpha = 0.7); // concise arrow function with no brackets
    menuReturnButton.on('pointerout',e=>e.currentTarget.alpha = 1.0); // ditto
    controlScene.addChild(menuReturnButton);
}



// Makes the Game Scene visible and resets all game-related variables
function startGame()
{
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    levelNum = 1;
    score = 0;
    life = 100;
    kills = 0;
    coolTime = 14;
    bulletCount = 1;
    calculateScore();
    decreaseLifeBy(0);
    displayLevel();
    ship.x = 300;
    ship.y = 500;
    loadLevel();
}



// Makes the Control Scene visible
function controlMenu()
{
    startScene.visible = false;
    controlScene.visible = true;
}



// Makes the Start Scene visible when coming from the Control Scene or Game Over Scene
function returnToMenu()
{
    controlScene.visible = false;
    gameOverScene.visible = false;
    startScene.visible = true;
}



// Display's the current level/wave to the player
function displayLevel()
{
    levelLabel.text = `Wave:    ${levelNum}`;
}



// Changes the user's health and displays it to the player
function decreaseLifeBy(value)
{
    life -= value;
    life = parseInt(life);
    lifeLabel.text = `Health:   ${life}`;
}



// Increases the amount of kills and displays it to the player
function increaseKillsBy(value)
{
    kills += value;
    killsLabel.text = `Kills:        ${kills}`;
}



// Calculates the current score and displays it to the player
function calculateScore()
{
    score = kills * levelNum;
    scoreLabel.text = `Score:    ${score}`;
}



// Calculates the current time and displays it to the player
function showTime()
{
    levelTime--;
    seconds = Math.round(levelTime * 0.02);
    timeLabel.text = `Time Until Next Wave: ${seconds}`;
}



// This code the loops as the game is played
function gameLoop()
{
	if(paused) return;
	
	// #1 - Calculate "delta time"
	let dt = 1 / app.ticker.FPS;
    if(dt > 1 / 12)
    {
        dt = 1 / 12;
    }

    // #2 - Move Ship
    if(keys["87"])
    {
        ship.y -= 5;
    }
    if(keys["65"])
    {
        ship.x -= 5;
    }
    if(keys["83"])
    {
        ship.y += 5;
    }
    if(keys["68"])
    {
        ship.x += 5;
    }
    
    // Keep the ship on the screen with clamp()
    let w2 = ship.width / 2;
    let h2 = ship.height / 2;
    ship.x = clamp(ship.x, 0 + w2, sceneWidth - w2);
    ship.y = clamp(ship.y, 0 + h2, sceneHeight - h2);
	
	// #3 - Move Aliens
    for(let a of aliens)
    {
        a.move(dt);

        if(a.x <= a.width/2 || a.x >= sceneWidth - a.width/2)
        {
            a.reflectX(sceneWidth);
        }
        if(a.y >= sceneHeight + a.height/2)
        {
            enemyEscapedSound.play();
            gameScene.removeChild(a);
            a.isAlive = false;
            decreaseLifeBy(4);
        }
    }

    // #4 - Firing Bullets
    if(keys["32"] && cooldown == 0)
    {
        fireBullet();
        cooldown = coolTime;
    }

    if(cooldown > 0)
    {
        cooldown--;
    }
	
	// #5 - Move Bullets
    for(let b of bullets)
    {
        b.move(dt);
    }

    // #6 - Move Power-Ups

    // #6A - Health-Ups
    for(let hu of healthUps)
    {
        hu.move(dt);

        if(hu.x <= hu.width || hu.x >= sceneWidth - hu.width)
        {
            hu.reflectX(sceneWidth);
        }
        if(hu.y <= hu.height || hu.y >= sceneHeight - hu.height)
        {
            hu.reflectY(sceneWidth);
        }
    }

    // #6B - Reload-Ups
    for(let ru of reloadUps)
    {
        ru.move(dt);

        if(ru.x <= ru.width || ru.x >= sceneWidth - ru.width)
        {
            ru.reflectX(sceneWidth);
        }
        if(ru.y <= ru.height || ru.y >= sceneHeight - ru.height)
        {
            ru.reflectY(sceneWidth);
        }
    }

    // #6C - Bullet-Ups
    for(let bu of bulletUps)
    {
        bu.move(dt);
        
        if(bu.x <= bu.width || bu.x >= sceneWidth - bu.width)
        {
            bu.reflectX(sceneWidth);
        }
        if(bu.y <= bu.height || bu.y >= sceneHeight - bu.height)
        {
            bu.reflectY(sceneWidth);
        }
    }
	
	// #7 - Check for Collisions
    for(let a of aliens)
    {
        for(let b of bullets)
        {
            // #7A - Aliens & Bullets
            if(rectsIntersect(a, b))
            {
                fireballSound.play();
                createExplosion(a.x, a.y, 64, 64);
                gameScene.removeChild(a);
                a.isAlive = false;
                gameScene.removeChild(b);
                b.isAlive = false;
                increaseKillsBy(1);
                calculateScore();
            }

            if(b.y < -10)
            {
                b.isAlive = false;
            }
        }

        // #7B - Aliens & Ship
        if(a.isAlive && rectsIntersect(a, ship))
        {
            hitSound.play();
            createExplosion(a.x, a.y, 64, 64);
            gameScene.removeChild(a);
            a.isAlive = false;
            decreaseLifeBy(10);
            increaseKillsBy(1);
            calculateScore();
        }
    }

    // #7C - Power-Ups & Ship
    for(let hu of healthUps)
    {
        if(hu.isAlive && rectsIntersect(hu, ship))
        {
            powerUpSound.play();
            gameScene.removeChild(hu);
            hu.isAlive = false;
            decreaseLifeBy(-40);
        }
    }
    for(let ru of reloadUps)
    {
        if(ru.isAlive && rectsIntersect(ru, ship))
        {
            powerUpSound.play();
            gameScene.removeChild(ru);
            ru.isAlive = false;
            coolTime -= 2;
        }
    }
    for(let bu of bulletUps)
    {
        if(bu.isAlive && rectsIntersect(bu, ship))
        {
            powerUpSound.play();
            gameScene.removeChild(bu);
            bu.isAlive = false;
            bulletCount++;
        }
    }
	
    // #8 - Now do some clean up
    
    // Get rid of dead bullets
    bullets = bullets.filter(b => b.isAlive);
    
    // Get rid of dead aliens
    aliens = aliens.filter(a => a.isAlive);

    // Get rid of power-ups
    healthUps = healthUps.filter(hu => hu.isAlive);
    reloadUps = reloadUps.filter(ru => ru.isAlive);
    bulletUps = bulletUps.filter(bu => bu.isAlive);

    // Get rid of explosions
    explosions = explosions.filter(e => e.playing);
	
	// #9 - Is game over?
    if(life <= 0)
    {
        end();
        return; // Return here to we skip #10 below
    }
	
    // #10 - Load next level
    if(levelTime <= 0)
    {
        levelNum++;
        loadLevel();
        displayLevel();
    }

    // #11 - Show the time remaining
    showTime();
    //console.log(aliens.length);
}



// This function checks for collisions using bounding boxes
function rectsIntersect(a, b)
{
    let aBox = a.getBounds();
    let bBox = b.getBounds();

    return (
        aBox.x + aBox.width > bBox.x &&
        aBox.x < bBox.x + bBox.width &&
        aBox.y + aBox.height > bBox.y &&
        aBox.y < bBox.y + bBox.height)
}



// This function creates the aliens enemies
function createAliens(numAliens)
{
    // Standard Bouncing Aliens
    for(let i = 0; i < numAliens / 4; i++)
    {
        let a = new Alien();
        a.x = Math.random() * (sceneWidth - 50) + 20;
        a.y = Math.random() * (sceneHeight - 400) - 200;
        aliens.push(a);
        gameScene.addChild(a);
    }

    // Phasing (Wrapping) Aliens
    for(let i = 0; i < numAliens / 4; i++)
    {
        let a = new WrappingAlien("images/Alien-Phaser.png");
        a.x = Math.random() * (sceneWidth - 50) + 20;
        a.y = Math.random() * (sceneHeight - 400) - 200;
        a.speed = 40;
        aliens.push(a);
        gameScene.addChild(a);
    }

    // Orthogonal Aliens
    for(let i = 0; i < numAliens / 4; i++)
    {
        let a = new Alien();
	    a.speed = Math.random() * 20 + 20;
        a.x = Math.random() * (sceneWidth - 50) + 20;
        a.y = Math.random() * (sceneHeight - 400) - 200;
        a.fwd.y = Math.random() * 2 + 1;
        if(Math.random() < .5)
        {
            a.fwd.x = Math.random() * 5 + 10;
        }
        else
        {
            a.fwd.x = Math.random() * (-5) - 10;
        }
        aliens.push(a);
        gameScene.addChild(a);
    }

    // Orthogonal Wrapping Aliens
    for(let i = 0; i < numAliens / 4; i++)
    {	
	    let a = new WrappingAlien("images/Alien-Phaser.png");
	    a.speed = Math.random() * 20 + 20;
        a.x = Math.random() * (sceneWidth - 50) + 20;
        a.y = Math.random() * (sceneHeight - 400) - 200;
        a.fwd.y = Math.random() * 2 + 1;
        if(Math.random() < .5)
        {
            a.fwd.x = Math.random() * 5 + 10;
        }
        else
        {
            a.fwd.x = Math.random() * (-5) - 10;
        }
	    aliens.push(a);
	    gameScene.addChild(a);
    }

    // Chasinging Aliens
    for(let i = 0; i < numAliens / 3; i++)
    {
        let a = new SeekingAlien("images/Alien-Chaser.png", 0.5);
        a.x = Math.random() * (sceneWidth - 50) + 25;
        a.y = Math.random() * (sceneHeight - 400) - 200;
        a.speed = 60;
        a.activate(ship);
        aliens.push(a);
        gameScene.addChild(a);
    }
}



// This function creates power-ups
function createPowerUps()
{
    // Health-Ups
    if(levelNum % 3 == 0)
    {
        let hu = new PowerUp("images/Health-Up.png");
        hu.x = Math.random() * (sceneWidth - 50) + 25;
        hu.y = Math.random() * (sceneHeight - 400) + 25;
        hu.speed = 60;
        healthUps.push(hu);
        gameScene.addChild(hu);
        //console.log("created health-up");
    }

    // Reload-Ups
    if(levelNum % 5 == 0 && levelNum <= 20)
    {
        let ru = new PowerUp("images/Reload-Up.png");
        ru.x = Math.random() * (sceneWidth - 50) + 25;
        ru.y = Math.random() * (sceneHeight - 400) + 25;
        ru.speed = 60;
        reloadUps.push(ru);
        gameScene.addChild(ru);
        //console.log("created reload-up");
    }

    // Bullet-Ups
    if(levelNum % 6 == 2 && levelNum <= 20)
    {
        let bu = new PowerUp("images/Bullet-Up.png");
        bu.x = Math.random() * (sceneWidth - 50) + 25;
        bu.y = Math.random() * (sceneHeight - 400) + 25;
        bu.speed = 60;
        bulletUps.push(bu);
        gameScene.addChild(bu);
        //console.log("created bullet-up");
    }
}



function loadLevel()
{
    // Clear out the current level
    aliens.forEach(a => gameScene.removeChild(a)); // Concise arrow function with no brackets and no return
    aliens = [];
    explosions.forEach(e => gameScene.removeChild(e)); // Ditto
    explosions = [];

    createAliens(levelNum * 5);
    createPowerUps();
    calculateScore();
    levelTime = 750;
    paused = false;
}



function end()
{
    paused = true;

    // Clear out the current level
    aliens.forEach(a => gameScene.removeChild(a)); // Concise arrow function with no brackets and no return
    aliens = [];
    bullets.forEach(b => gameScene.removeChild(b)); // Ditto
    bullets = [];
    explosions.forEach(e => gameScene.removeChild(e)); // Ditto
    explosions = [];
    healthUps.forEach(h => gameScene.removeChild(h)); // Ditto
    healthUps = [];
    reloadUps.forEach(r => gameScene.removeChild(r)); // Ditto
    reloadUps = [];
    bulletUps.forEach(bu => gameScene.removeChild(bu)); // Ditto
    bulletUps = [];

    calculateScore();

    checkHighScore();

    gameOverScoreLabel.text = `Your final score: ${score}`;
    finalLevelLabel.text = `Final Level: ${levelNum}`;
    finalKillsLabel.text = `Final Kills: ${kills}`;

    gameOverScene.visible = true;
    gameScene.visible = false;
}



function checkHighScore()
{
    if(score > highScoreField)
    {
        localStorage.setItem("highScoreKey", score);
        highScoreField = score;
    }

    highScoreLabel.text = `High Score:   ${highScoreField}`;
}



function fireBullet(e)
{
    if(paused)
    {
        return;
    }
    
    if(bulletCount == 5)
    {
        let b5 = new Bullet(0xFFFFFF, ship.x, ship.y);
        b5.speed *= -1;
        bullets.push(b5);
        gameScene.addChild(b5);
    }
    if(bulletCount >= 4)
    {
        let b1 = new Bullet(0xFFFFFF, ship.x - 15, ship.y);
        let b2 = new Bullet(0xFFFFFF, ship.x - 5, ship.y);
        let b3 = new Bullet(0xFFFFFF, ship.x + 5, ship.y);
        let b4 = new Bullet(0xFFFFFF, ship.x + 15, ship.y);
        bullets.push(b1);
        bullets.push(b2);
        bullets.push(b3);
        bullets.push(b4);
        gameScene.addChild(b1);
        gameScene.addChild(b2);
        gameScene.addChild(b3);
        gameScene.addChild(b4);
    }
    else if(bulletCount == 3)
    {
        let b1 = new Bullet(0xFFFFFF, ship.x - 10, ship.y);
        let b2 = new Bullet(0xFFFFFF, ship.x, ship.y);
        let b3 = new Bullet(0xFFFFFF, ship.x + 10, ship.y);
        bullets.push(b1);
        bullets.push(b2);
        bullets.push(b3);
        gameScene.addChild(b1);
        gameScene.addChild(b2);
        gameScene.addChild(b3);
    }
    else if(bulletCount == 2)
    {
        let b1 = new Bullet(0xFFFFFF, ship.x - 5, ship.y);
        let b2 = new Bullet(0xFFFFFF, ship.x + 5, ship.y);
        bullets.push(b1);
        bullets.push(b2);
        gameScene.addChild(b1);
        gameScene.addChild(b2);
    }
    else
    {
        let b = new Bullet(0xFFFFFF, ship.x, ship.y);
        bullets.push(b);
        gameScene.addChild(b);
    }
    shootSound.play();
}



function loadSpriteSheet()
{
    // The 16 animation frames in each row are 64x64 pixels
    // We are using the second row
    // http://pixijs.download/release/docs/PIXI.BaseTexture.html
    let spriteSheet = PIXI.BaseTexture.from("images/explosions.png");
    let width = 64;
    let height = 64;
    let numFrames = 16;
    let textures = [];
    for(let i = 0; i < numFrames; i++)
    {
        // http://pixijs.download/release/docs/PIXI.Texture.html
        let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i * width, 64, width, height));
        textures.push(frame);
    }
    return textures;
}



function createExplosion(x, y, frameWidth, frameHeight)
{
    // http://pixijs.download/release/docs/PIXI.AnimatedSprite.html
    // The animation frames are 64x64 pixels
    let w2 = frameWidth / 2;
    let h2 = frameHeight / 2;
    let expl = new PIXI.AnimatedSprite(explosionTextures);
    expl.x = x - w2;
    expl.y = y - h2;
    expl.animationSpeed = 1 / 7;
    expl.loop = false;
    expl.onComplete = e => gameScene.removeChild(expl);
    explosions.push(expl);
    gameScene.addChild(expl);
    expl.play();
}