// Game
let viewPort;
let portWidth = window.innerWidth;
let portHeight = window.innerHeight;
let gameView;

//Player related variables
let wingManWidth = 35;
let wingManHeight = 25;
let wingManX = portWidth/10;
let wingManY = portHeight/2;

let wingManImage;

let wingMan =
{
    x : wingManX,
    y : wingManY,
    width : wingManWidth,
    height : wingManHeight
}

let wingFlopY = 0;
let gravity = 0.2;

// Cloud related variables
let cloudArray = [];
let cloudWidth = 64;
let cloudHeight = 512;
let cloudX = portWidth;
let cloudY = 0;

let topCloudImage;
let bottomCloudImage;

let cloudSpeedX = -2;

// Sound effects
let flopSound = new Audio("./AssetFolder/Sounds/Sputter.mp3"); 
let cloudPassSound = new Audio("./AssetFolder/Sounds/studiokolomna-fast-whoosh-118248.mp3");
let dieSound = new Audio("./AssetFolder/Sounds/small-explosion by DennisH18.mp3");

// Background music
let bgMusic = new Audio("./AssetFolder/Sounds/the-return-of-the-8-bit-era-301292 by DJARTMUSIC.mp3");

// Game States
let isOver = false;
let score = 0;
function loadSounds() {
    flopSound = new Audio("./AssetFolder/Sounds/Sputter.mp3");
    flopSound.volume = 0.2;
    cloudPassSound = new Audio("./AssetFolder/Sounds/studiokolomna-fast-whoosh-118248.mp3");
    dieSound = new Audio("./AssetFolder/Sounds/small-explosion by DennisH18.mp3");
    dieSound.volume = 0.2;
    bgMusic = new Audio("./AssetFolder/Sounds/the-return-of-the-8-bit-era-301292 by DJARTMUSIC.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
}

window.onload = function()
{
    viewPort = document.getElementById("viewPort");
    viewPort.width = portWidth;
    viewPort.height = portHeight;
    gameView = viewPort.getContext("2d");

    wingManImage = new Image();
    wingManImage.src = "./AssetFolder/wingMan.png";
    wingManImage.onload = function ()
    {
        gameView.drawImage(wingManImage, wingMan.x, wingMan.y, wingMan.width, wingMan.height);
    }
    topCloudImage = new Image();
    topCloudImage.src = "./AssetFolder/topCloud.png";

    bottomCloudImage = new Image();
    bottomCloudImage.src = "./AssetFolder/bottomCloud.png";

    requestAnimationFrame(update);

    setInterval(spawnClouds, 2000);

    loadSounds();
    document.addEventListener("keydown", flopWing);

    document.addEventListener("touchstart", function(e) {
    e.preventDefault();
    flopWing(e);
}, { passive: false });
}
  
function update()
{
    requestAnimationFrame(update)

    if (isOver)
    {
        return;
    }

    gameView.clearRect(0, 0, viewPort.width, viewPort.height);

    wingFlopY += gravity;
    wingMan.y = Math.max(wingMan.y + wingFlopY, 0);
    gameView.drawImage(wingManImage, wingMan.x, wingMan.y, wingMan.width, wingMan.height);

    if (wingMan.y > viewPort.height)
    {
        isOver = true;
        dieSound.play();
    }

    for (let i = 0; i < cloudArray.length; i++)
    {
        let cloud = cloudArray[i];
        cloud.x += cloudSpeedX;
        gameView.drawImage(cloud.img, cloud.x, cloud.y, cloud.width, cloud.height);

        if (!cloud.passed && wingMan.x > cloud.x + cloud.width)
        {
            score += 0.5;
            cloud.passed = true;
            cloudPassSound.play();
        }
        if (hitDetect(wingMan, cloud))
        {
            isOver = true;
            dieSound.play();
        }
    }
    while (cloudArray.length > 0 && cloudArray[0].x < -cloudWidth)
    {
        cloudArray.shift();
    }

    gameView.fillStyle = "deepskyblue";
    gameView.textAlign = "center";
    gameView.textBaseline = "top";
    gameView.font = `${getFontSize(60)}px monospace`;
    gameView.fillText("Score: " + score, viewPort.width / 2, 10);   

    if (isOver)
    {
        gameView.fillStyle = "green";
        gameView.textAlign = "center";
        gameView.textBaseline = "middle";
        gameView.font = `${getFontSize(100)}px monospace`;
        gameView.fillText("OUT OF FUEL", viewPort.width / 2, viewPort.height / 2);

        gameView.font = `${getFontSize(20)}px monospace`;
        gameView.fillText("PRESS [SPACE]/[PgUp] to restart", viewPort.width / 2, (viewPort.height / 2) + 60);   
    }
}

function spawnClouds()
{
    if (isOver)
    {
        return;
    }

    let randomCloudY = cloudY - cloudHeight/4 - Math.random()*(cloudHeight/2);
    let parting = viewPort.height/4;
    let topCloud =
    {
        img : topCloudImage,
        x : cloudX,
        y : randomCloudY,
        width : cloudWidth,
        height : cloudHeight,
        passed : false
    }
    cloudArray.push(topCloud);

    let bottomCloud =
    {
        img : bottomCloudImage,
        x : cloudX,
        y : randomCloudY + cloudHeight + parting,
        width : cloudWidth,
        height : cloudHeight,
        passed : false
    }
    cloudArray.push(bottomCloud);
}

function flopWing (control)
{
    if (control.code == "Space" || control.code == "ArrowUp")
    {
        wingFlopY = -6;
        playSound(flopSound);
        if (isOver)
        {
            restartGame();
        }
    }
    else
    {
        wingFlopY = -6;
        playSound(flopSound);
        if (isOver)
        {
           restartGame();
        }
    }
}

function restartGame()
{
    if (isOver)
        {
            wingMan.y = wingManY;
            cloudArray = [];
            score = 0;
            isOver = false;
            bgMusic.currentTime = 0;
            bgMusic.play().catch(e => console.log("Audio failed:", e));
        }
}

function hitDetect(player, other)
{
    return  player.x < other.x + other.width &&
            player.x + player.width > other.x &&
            player.y < other.y + other.height &&
            player.y + player.height > other.y;
}

document.addEventListener("keydown", () => 
    {
        bgMusic.play().catch(e => console.log("Audio failed:", e));
    }
, { once: true });

function playSound(audio)
{
    let clone = audio.cloneNode();
    clone.volume = flopSound.volume; 
    clone.play().catch(e => console.log("Audio failed:", e));
}

function getFontSize(baseSize)
{
    return Math.max(baseSize * (window.innerWidth / 1024), baseSize * 0.5);
}   

window.addEventListener('resize', () =>
{
    viewPort.width = window.innerWidth;
    viewPort.height = window.innerHeight;
});   