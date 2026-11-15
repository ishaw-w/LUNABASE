
/* =========================================================
   LUNABASE — 10 UNIQUE MINI-GAME CAMPAIGN
   Built for the supplied index.html and style.css
   No external game libraries or sound downloads required.
========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

let screen = "home";
let currentDay = 1;
let score = 0;
let science = 0;
let health = 100;
let oxygen = 100;
let energy = 100;
let radiation = 0;

let playerName = "Junior Astronaut";
let suit = "cyan";
let difficulty = "Cadet";

let running = false;
let paused = false;
let completed = false;
let animationId = null;
let lastTime = 0;
let missionTime = 0;
let message = "";
let messageTimer = 0;
let missionState = {};
let soundEnabled = true;
let audio = null;

const keys = {};
const particles = [];

const suitColors = {
    cyan: "#54dfff",
    orange: "#ff9c55",
    purple: "#c38aff",
    green: "#76ed9b"
};

/* =========================================================
   1. MISSION INFORMATION
========================================================= */

const missions = [
    {
        title: "TOUCHDOWN ON THE MOON",
        subtitle: "Land your spacecraft safely!",
        instructions: "Use LEFT and RIGHT to control your ship. Hold SPACE to slow down. Land gently on the landing pad.",
        controls: "LEFT / RIGHT = STEER     SPACE = BRAKE",
        goal: "Land on the blue landing pad without crashing.",
        type: "landing"
    },
    {
        title: "ROVER RESCUE",
        subtitle: "Find the lost lunar robot!",
        instructions: "Drive your rover through the rocky Moon surface. Avoid the craters and reach the stranded robot.",
        controls: "ARROW KEYS / WASD = DRIVE",
        goal: "Reach the robot without hitting too many rocks.",
        type: "rover"
    },
    {
        title: "OXYGEN EMERGENCY",
        subtitle: "Collect oxygen before time runs out!",
        instructions: "Move around the Moon and collect all 8 oxygen tanks. Your oxygen is running low!",
        controls: "ARROW KEYS / WASD = MOVE",
        goal: "Collect 8 oxygen tanks.",
        type: "oxygen"
    },
    {
        title: "POWER UP!",
        subtitle: "Repair the solar power system!",
        instructions: "Connect the power stations in the correct order. Click the numbered stations from 1 to 5.",
        controls: "CLICK THE POWER STATIONS",
        goal: "Connect all 5 stations in order.",
        type: "wiring"
    },
    {
        title: "MOON ROCK DETECTIVE",
        subtitle: "Find the right science sample!",
        instructions: "The science computer gives you a clue. Read it carefully and click the correct Moon rock.",
        controls: "CLICK THE CORRECT ROCK",
        goal: "Find 3 useful science samples.",
        type: "samples"
    },
    {
        title: "BUILD YOUR MOON HOME",
        subtitle: "Put the habitat together!",
        instructions: "Your Moon home is missing important parts. Click the parts in the correct building order.",
        controls: "CLICK THE PARTS IN ORDER",
        goal: "Build the habitat using all 5 parts.",
        type: "building"
    },
    {
        title: "SOLAR STORM ALERT",
        subtitle: "Find shelter before the storm!",
        instructions: "Solar particles are approaching! Move your astronaut to the shelter and avoid the glowing hazards.",
        controls: "ARROW KEYS / WASD = MOVE",
        goal: "Reach the shelter and stay safe.",
        type: "storm"
    },
    {
        title: "LOST SIGNAL",
        subtitle: "Reconnect with mission control!",
        instructions: "Move the antenna angle using LEFT and RIGHT. Press SPACE when the signal is in the green zone.",
        controls: "LEFT / RIGHT = AIM     SPACE = SEND",
        goal: "Connect the signal 3 times.",
        type: "signal"
    },
    {
        title: "BASE EMERGENCY",
        subtitle: "Save the lunar research base!",
        instructions: "Three systems are failing. Repair them in the correct priority order before the timer runs out.",
        controls: "CLICK: OXYGEN → POWER → WATER",
        goal: "Repair all 3 systems in the correct order.",
        type: "emergency"
    },
    {
        title: "RETURN TO EARTH",
        subtitle: "Prepare for your journey home!",
        instructions: "Complete the launch checklist. Press the keys shown on screen in the correct order.",
        controls: "FOLLOW THE ON-SCREEN KEYS",
        goal: "Complete the launch sequence!",
        type: "launch"
    }
 ];

/* =========================================================
   SHORT LEARNING QUIZ — ONE QUESTION AFTER EACH MISSION
   Facts are based on NASA Moon resources.
========================================================= */
const missionQuiz = [
    {
        question: "How strong is gravity on the Moon compared with Earth?",
        choices: ["About the same", "About one-sixth as strong", "Twice as strong"],
        answer: 1,
        fact: "The Moon's gravity is about one-sixth of Earth's. That is why astronauts can make big, slow-motion-looking jumps!",
        source: "https://spaceplace.nasa.gov/all-about-the-moon/"
    },
    {
        question: "Why must a lander use its engines to slow down before touching the Moon?",
        choices: ["The Moon has almost no atmosphere", "The Moon is covered in clouds", "Parachutes work too well there"],
        answer: 0,
        fact: "The Moon has almost no atmosphere, so a spacecraft cannot rely on air resistance or parachutes to slow down like it can on Earth.",
        source: "https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/moon/"
    },
    {
        question: "Can astronauts breathe the Moon's very thin atmosphere?",
        choices: ["Yes, like Earth's air", "Only during the daytime", "No, it is not breathable"],
        answer: 2,
        fact: "The Moon has an extremely thin atmosphere called an exosphere. It is not breathable, so astronauts need spacesuits and oxygen.",
        source: "https://science.nasa.gov/moon/facts/"
    },
    {
        question: "What do solar panels collect to make electricity for a Moon base?",
        choices: ["Sunlight", "Moon dust", "Sound waves"],
        answer: 0,
        fact: "Solar panels turn sunlight into electrical power. Choosing a location with useful sunlight is important for future lunar bases.",
        source: "https://www.nasa.gov/reference/moonbase-environment/"
    },
    {
        question: "Why do scientists study and collect Moon rocks?",
        choices: ["To make jewellery", "To learn about the Moon's history", "To grow plants"],
        answer: 1,
        fact: "Moon rocks and soil help scientists understand how the Moon formed and how its surface changed over billions of years.",
        source: "https://science.nasa.gov/moon/facts/"
    },
    {
        question: "Where has NASA found water ice on the Moon?",
        choices: ["In warm oceans", "In some permanently shadowed polar craters", "Floating above the Moon"],
        answer: 1,
        fact: "Water ice exists in very cold, permanently shadowed areas near the lunar poles. Future explorers may study how to use this resource.",
        source: "https://science.nasa.gov/moon/moon-water-and-ices/"
    },
    {
        question: "Why do astronauts need protection from space radiation on the Moon?",
        choices: ["The Moon has little atmosphere and no global magnetic field", "The Moon has too many clouds", "The Moon is too close to Earth"],
        answer: 0,
        fact: "The Moon has hardly any atmosphere and no global magnetic field to shield its surface from space radiation. Astronauts need suitable spacesuits, shelter, and careful mission planning to reduce their exposure.",
        source: "https://science.nasa.gov/moon/weather-on-the-moon/"
    },
    {
        question: "What is the antenna used for in a lunar mission?",
        choices: ["To make oxygen", "To communicate using radio signals", "To create gravity"],
        answer: 1,
        fact: "Spacecraft use radio communication systems and antennas to send information to Earth and receive instructions from mission control.",
        source: "https://science.nasa.gov/moon/"
    },
    {
        question: "Why can old footprints and rover tracks remain on the Moon for a very long time?",
        choices: ["There is no wind or rain to erase them", "The Moon is made of ice", "The tracks are painted"],
        answer: 0,
        fact: "The Moon has no weather like Earth's wind and rain, so footprints and rover tracks can remain on the surface for a very long time.",
        source: "https://science.nasa.gov/mission/lro/about/"
    },
    {
        question: "Why is water ice useful for future Moon explorers?",
        choices: ["It can only be used to decorate the base", "It may help provide drinking water, oxygen, or rocket fuel", "It makes the Moon warmer"],
        answer: 1,
        fact: "NASA explains that lunar water ice could one day help provide drinking water, breathable oxygen, and even rocket fuel for future exploration.",
        source: "https://www.nasa.gov/general/is-there-water-on-the-moon-we-asked-a-nasa-scientist-episode-27/"
    }
];

/* =========================================================
   2. SOUND EFFECTS
========================================================= */

function unlockSound() {
    if (!soundEnabled) return;

    try {
        if (!audio) {
            audio = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (audio.state === "suspended") audio.resume();
    } catch (e) {
        console.log("Audio is unavailable.");
    }
}

function tone(freq, duration = 0.12, type = "sine", volume = 0.05) {
    if (!soundEnabled || !audio) return;

    try {
        const osc = audio.createOscillator();
        const gain = audio.createGain();

        osc.type = type;
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(volume, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audio.currentTime + duration
        );

        osc.connect(gain);
        gain.connect(audio.destination);

        osc.start();
        osc.stop(audio.currentTime + duration);
    } catch (e) {}
}

function playSound(name) {
    unlockSound();

    const sounds = {
        click: () => tone(450, 0.07, "square", 0.025),
        collect: () => {
            tone(650, 0.12);
            setTimeout(() => tone(900, 0.16), 100);
        },
        repair: () => {
            tone(350, 0.12, "triangle");
            setTimeout(() => tone(650, 0.18, "triangle"), 150);
        },
        warning: () => {
            tone(220, 0.2, "sawtooth");
            setTimeout(() => tone(180, 0.2, "sawtooth"), 220);
        },
        win: () => {
            tone(500, 0.15);
            setTimeout(() => tone(650, 0.15), 150);
            setTimeout(() => tone(850, 0.25), 300);
        },
        crash: () => {
            tone(120, 0.3, "sawtooth", 0.08);
            setTimeout(() => tone(80, 0.3, "sawtooth", 0.08), 150);
        },
        launch: () => {
            tone(250, 0.3, "sawtooth");
            setTimeout(() => tone(400, 0.3, "sawtooth"), 200);
            setTimeout(() => tone(700, 0.5), 450);
        }
    };

    if (sounds[name]) sounds[name]();
}

function toggleSound() {
    soundEnabled = !soundEnabled;

    const button = document.getElementById("sound-toggle");
    if (button) {
        button.textContent = soundEnabled ? "🔊 SOUND ON" : "🔇 SOUND OFF";
    }

    if (soundEnabled) playSound("win");
}

/* =========================================================
   3. SCREEN NAVIGATION
========================================================= */

function showScreen(id) {
    document.querySelectorAll(".screen").forEach(el => {
        el.classList.remove("active");
        el.style.display = "none";
    });

    const target = document.getElementById(id);

    if (target) {
        target.classList.add("active");
        target.style.display = "block";
    }

    screen = id;
    playSound("click");
}

function startGame() {
    showScreen("menu-screen");
}

function showProfile() {
    showScreen("profile-screen");
}

function showInstructions() {
    showScreen("briefing-screen");
}

function showAbout() {
    showScreen("briefing-screen");
}

function goHome() {
    showScreen("home-screen");
}

/* =========================================================
   4. ASTRONAUT PROFILE
========================================================= */

function selectSuit(color, button) {
    suit = color;

    document.querySelectorAll(".suit-choice").forEach(el => {
        el.classList.remove("selected");
    });

    if (button) button.classList.add("selected");

    const avatar = document.getElementById("astronaut-avatar");
    const label = document.getElementById("suit-label");

    if (avatar) avatar.style.filter =
        `drop-shadow(0 0 15px ${suitColors[color]})`;

    if (label) label.textContent = color.toUpperCase() + " EXPLORER SUIT";

    playSound("click");
}

function selectDifficulty(level, button) {
    difficulty = level;

    document.querySelectorAll(".difficulty-card").forEach(el => {
        el.classList.remove("selected");
    });

    if (button) button.classList.add("selected");

    playSound("click");
}

function saveProfile() {
    const input = document.getElementById("player-name");
    const error = document.getElementById("profile-error");

    const name = input ? input.value.trim() : "";

    if (!name) {
        if (error) error.textContent = "PLEASE ENTER YOUR ASTRONAUT NAME!";
        playSound("warning");
        return;
    }

    playerName = name.substring(0, 16);

    localStorage.setItem("lunabaseProfile", JSON.stringify({
        name: playerName,
        suit,
        difficulty
    }));

    if (error) error.textContent = "";

    showScreen("briefing-screen");
    playSound("win");
}

function loadProfile() {
    try {
        const saved = JSON.parse(localStorage.getItem("lunabaseProfile") || "null");
        if (!saved) return;

        playerName = saved.name || playerName;
        suit = saved.suit || suit;
        difficulty = saved.difficulty || difficulty;

        const input = document.getElementById("player-name");
        if (input) input.value = playerName;

        const avatar = document.getElementById("astronaut-avatar");
        if (avatar) avatar.style.filter =
            `drop-shadow(0 0 15px ${suitColors[suit] || suitColors.cyan})`;
    } catch (e) {}
}

/* =========================================================
   5. GAME SETUP
========================================================= */

function enterBase() {
    unlockSound();

    currentDay = 1;
    score = 0;
    science = 0;
    health = 100;
    oxygen = 100;
    energy = 100;
    radiation = 0;

    showScreen("game-screen");
    createExtraControls();
    startMission();
}

function createExtraControls() {
    if (!document.getElementById("sound-toggle")) {
        const sound = document.createElement("button");
        sound.id = "sound-toggle";
        sound.textContent = "🔊 SOUND ON";
        sound.onclick = toggleSound;
        sound.style.cssText = `
            position:fixed;right:15px;bottom:15px;z-index:9999;
            background:#1d315e;color:white;border:2px solid #68dfff;
            border-radius:8px;padding:10px;cursor:pointer;
            font-family:inherit;
        `;
        document.body.appendChild(sound);
    }

    if (!document.getElementById("mission-overlay")) {
        const overlay = document.createElement("div");
        overlay.id = "mission-overlay";
        overlay.style.cssText = `
            position:fixed;inset:0;z-index:9998;
            display:none;align-items:center;justify-content:center;
            padding:20px;background:rgba(5,8,25,.94);
            backdrop-filter:blur(7px);
        `;
        document.body.appendChild(overlay);
    }

    if (!document.getElementById("mission-extra-style")) {
        const style = document.createElement("style");
        style.id = "mission-extra-style";
        style.textContent = `
            .mission-card {
                width:min(650px,100%);padding:28px;text-align:center;
                background:linear-gradient(145deg,#1a2754,#10152f);
                border:3px solid #69dfff;border-radius:16px;
                color:white;box-shadow:0 0 35px #244c82;
                font-family:'Silkscreen',sans-serif;
            }
            .mission-card h2 {
                color:#ffe17a;font-family:'Press Start 2P',sans-serif;
                font-size:16px;line-height:2;margin:15px 0;
            }
            .mission-card p {font-size:12px;line-height:1.9;margin:10px 0;}
            .mission-card .mission-instruction {font-size:13px;font-weight:700;color:#f2f7ff;}
            .mission-card .mission-goal {color:#a9dfff;font-weight:700;}
            .mission-card .quiz-question {font-size:14px;font-weight:700;color:#fff;line-height:1.8;}
            .mission-card .quiz-fact {color:#c8eaff;font-size:11px;line-height:1.9;}
            .mission-card .quiz-choice {display:block;width:min(100%,520px);margin:10px auto;padding:13px 12px;}
            .mission-card .quiz-source {display:inline-block;margin-top:10px;color:#8edcff;font-size:10px;}
            #game-screen .game-lower, #game-screen .game-controls, #game-screen #astro-message {display:none!important;}
            .mission-card button {
                margin:8px;padding:13px 18px;background:#ffcf65;
                color:#462b54;border:3px solid #f49ac8;
                font-family:'Press Start 2P',sans-serif;
                font-size:9px;cursor:pointer;
            }
            .mission-card button:hover {filter:brightness(1.15);transform:scale(1.04);}
            .mission-small {color:#a9dfff;font-size:10px!important;}
            #gameCanvas {cursor:crosshair;touch-action:none;}
        `;
        document.head.appendChild(style);
    }
}

function showOverlay(html) {
    const overlay = document.getElementById("mission-overlay");
    overlay.innerHTML = `<div class="mission-card">${html}</div>`;
    overlay.style.display = "flex";
}

function hideOverlay() {
    const overlay = document.getElementById("mission-overlay");
    if (overlay) overlay.style.display = "none";
}

/* =========================================================
   6. MISSION START AND PROGRESSION
========================================================= */

function startMission() {
    if (currentDay > 10) {
        finishCampaign();
        return;
    }

    running = false;
    paused = false;
    completed = false;

    missionTime = 0;
    lastTime = performance.now();

    missionState = {};
    particles.length = 0;

    const mission = missions[currentDay - 1];
    updateHUD();
    updateObjectives();

    showOverlay(`
        <div style="font-size:48px">🚀🌙</div>
        <p class="mission-small">LUNABASE MISSION ${String(currentDay).padStart(2, "0")} / 10</p>
        <h2>${mission.title}</h2>
        <p>${mission.subtitle}</p>
        <p class="mission-instruction">${mission.instructions}</p>
        <p class="mission-goal">GOAL: ${mission.goal}</p>
        <button id="start-this-mission">START MISSION ▶</button>
    `);

    document.getElementById("start-this-mission").onclick = () => {
        hideOverlay();
        setupMiniGame();
        running = true;
        lastTime = performance.now();
        playSound("win");
        animationId = requestAnimationFrame(gameLoop);
    };

    updateDayLabel();
    setMessage("Mission " + currentDay + ": " + mission.title);
}

function setupMiniGame() {
    const type = missions[currentDay - 1].type;

    if (type === "landing") setupLanding();
    if (type === "rover") setupRover();
    if (type === "oxygen") setupOxygen();
    if (type === "wiring") setupWiring();
    if (type === "samples") setupSamples();
    if (type === "building") setupBuilding();
    if (type === "storm") setupStorm();
    if (type === "signal") setupSignal();
    if (type === "emergency") setupEmergency();
    if (type === "launch") setupLaunch();
}

function completeMiniGame() {
    if (completed) return;

    completed = true;
    running = false;

    score += 100 + Math.max(0, Math.floor(energy));
    science += 1;

    energy = Math.min(100, energy + 8);
    oxygen = Math.max(10, oxygen - 3);
    health = Math.min(100, health + 4);

    updateHUD();
    playSound("win");

    // A short learning question follows every mission.
    showMissionQuiz();
}

function showMissionQuiz() {
    const quiz = missionQuiz[currentDay - 1];
    if (!quiz) {
        goToNextMission();
        return;
    }

    showOverlay(`
        <div style="font-size:42px">🧠🌙</div>
        <p class="mission-small">MISSION ${currentDay} COMPLETE · QUICK SPACE QUIZ</p>
        <h2>WHAT DID YOU LEARN?</h2>
        <p class="quiz-question">${quiz.question}</p>
        <div id="quiz-choices">
            ${quiz.choices.map((choice, index) =>
                `<button class="quiz-choice" data-answer="${index}">${String.fromCharCode(65 + index)}. ${choice}</button>`
            ).join("")}
        </div>
        <p id="quiz-feedback" class="quiz-fact">Choose the best answer. No points are lost for trying!</p>
    `);

    document.querySelectorAll("#quiz-choices [data-answer]").forEach(button => {
        button.onclick = () => answerMissionQuiz(Number(button.dataset.answer));
    });
}

function answerMissionQuiz(selected) {
    const quiz = missionQuiz[currentDay - 1];
    if (!quiz) return;

    if (selected === quiz.answer) {
        score += 25;
        updateHUD();
        playSound("win");
        showOverlay(`
            <div style="font-size:48px">🌟🧠</div>
            <p class="mission-small">CORRECT ANSWER · +25 BONUS POINTS</p>
            <h2>GREAT LEARNING!</h2>
            <p class="quiz-fact">${quiz.fact}</p>
            <a class="quiz-source" href="${quiz.source}" target="_blank" rel="noopener">LEARN MORE · NASA</a>
            <p class="mission-small">You can continue your astronaut training now.</p>
            <button id="continue-mission">NEXT MISSION 🚀</button>
        `);
        document.getElementById("continue-mission").onclick = goToNextMission;
    } else {
        playSound("warning");
        const feedback = document.getElementById("quiz-feedback");
        if (feedback) feedback.textContent = "Not quite! Try another answer — you can do it, astronaut.";
    }
}

function goToNextMission() {
    currentDay++;
    if (currentDay > 10) {
        finishCampaign();
    } else {
        startMission();
    }
}

function failMiniGame(reason) {
    if (completed) return;

    completed = true;
    running = false;

    health = Math.max(10, health - 10);
    energy = Math.max(5, energy - 10);
    updateHUD();

    playSound("warning");

    showOverlay(`
        <div style="font-size:45px">🛠️</div>
        <h2>TRY AGAIN, ASTRONAUT!</h2>
        <p>${reason}</p>
        <p>Your team has helped repair your equipment.</p>
        <button id="retry-mission">TRY AGAIN</button>
        <button id="leave-mission">END CAMPAIGN</button>
    `);

    document.getElementById("retry-mission").onclick = () => startMission();
    document.getElementById("leave-mission").onclick = () => finishCampaign();
}

function escapeText(text) {
    return String(text).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

/* =========================================================
   7. MISSION 1 — SPACECRAFT LANDING
========================================================= */

function setupLanding() {
    missionState = {
        x: 480,
        y: 90,
        vx: 0,
        vy: 0,
        fuel: 100,
        padX: 385,
        padWidth: 230,
        landed: false
    };
}

function updateLanding(dt) {
    const s = missionState;

    if (s.landed) return;

    const left = keys["arrowleft"] || keys["a"];
    const right = keys["arrowright"] || keys["d"];
    const thrust = keys[" "] || keys["space"];

    // Move left and right
    if (left) s.vx -= 85 * dt;
    if (right) s.vx += 85 * dt;

    // Slow down sideways movement
    s.vx *= Math.exp(-1.8 * dt);
    s.vx = Math.max(-130, Math.min(130, s.vx));

    // Moon gravity
    s.vy += 42 * dt;

    // Rocket engine: hold SPACE to slow the fall
    if (thrust && s.fuel > 0) {
        s.vy -= 105 * dt;
        s.fuel -= 20 * dt;

        s.fuel = Math.max(0, s.fuel);
    }

    // Move the spacecraft
    s.x += s.vx * dt;
    s.y += s.vy * dt;

    // Keep the rocket inside the screen
    s.x = Math.max(10, Math.min(W - 50, s.x));

    // Landing surface is at y = 470.
    // The rocket body is approximately 60 pixels tall.
    const groundLevel = 410;

    if (s.y >= groundLevel) {
        s.y = groundLevel;

        // Check the center of the spacecraft
        const rocketCenter = s.x + 20;

        const onPad =
            rocketCenter >= s.padX &&
            rocketCenter <= s.padX + s.padWidth;

        // More forgiving landing speed
        const safeVerticalSpeed = s.vy <= 115;
        const safeHorizontalSpeed = Math.abs(s.vx) <= 95;

        if (onPad && safeVerticalSpeed && safeHorizontalSpeed) {
            s.landed = true;
            s.vy = 0;
            s.vx = 0;

            setMessage("AMAZING! YOU LANDED ON THE MOON! 🌙");
            playSound("win");

            completeMiniGame();
        } else {
            s.landed = true;
            playSound("crash");

            let reason = "Your spacecraft crashed! ";

            if (!onPad) {
                reason += "You missed the landing pad.";
            } else {
                reason += "Try landing more slowly.";
            }

            failMiniGame(reason);
        }
    }
}

function drawLanding() {
    drawMoonBackground();

    const s = missionState;

    // Landing platform
    ctx.fillStyle = "#36d6ff";
    ctx.fillRect(s.padX, 470, s.padWidth, 10);

    ctx.fillStyle = "#b5eaff";
    ctx.fillRect(s.padX + 20, 480, s.padWidth - 40, 5);

    drawText(
        "LAND HERE!",
        s.padX + 65,
        455,
        "#ffe17a",
        17
    );

    // Draw spacecraft
    drawShip(s.x, s.y);

    // Mission information
    drawText(
        "FUEL: " + Math.max(0, Math.round(s.fuel)) + "%",
        25, 40, "#ffe17a", 18
    );

    drawText(
        "FALL SPEED: " + Math.max(0, Math.round(s.vy)),
        25, 70, "white", 16
    );

    drawText(
        "HOLD SPACE TO SLOW DOWN!",
        330, 35, "#7ceaff", 18
    );

    // Landing speed guide
    drawText(
        "SAFE LANDING SPEED: UNDER 115",
        320, 65, "#8cffbd", 14
    );
}
/* =========================================================
   8. MISSION 2 — ROVER RESCUE
========================================================= */

function setupRover() {
    missionState = {
        x: 80,
        y: 280,
        robotX: 875,
        robotY: 280,
        rocks: [
            { x: 250, y: 200, r: 32 },
            { x: 400, y: 380, r: 38 },
            { x: 560, y: 180, r: 40 },
            { x: 680, y: 400, r: 32 },
            { x: 790, y: 160, r: 35 }
        ],
        hits: 0
    };
}

function updateRover(dt) {
    const s = missionState;
    const speed = 220;

    if (keys["arrowup"] || keys["w"]) s.y -= speed * dt;
    if (keys["arrowdown"] || keys["s"]) s.y += speed * dt;
    if (keys["arrowleft"] || keys["a"]) s.x -= speed * dt;
    if (keys["arrowright"] || keys["d"]) s.x += speed * dt;

    s.x = Math.max(20, Math.min(W - 55, s.x));
    s.y = Math.max(90, Math.min(H - 50, s.y));

    s.rocks.forEach(rock => {
        if (distance(s.x + 20, s.y + 15, rock.x, rock.y) < rock.r + 15) {
            s.x -= (keys["arrowright"] || keys["d"] ? 4 : 0);
            s.x += (keys["arrowleft"] || keys["a"] ? 4 : 0);
            s.hits++;
            if (s.hits % 30 === 1) {
                energy = Math.max(0, energy - 4);
                playSound("crash");
            }
        }
    });

    if (distance(s.x, s.y, s.robotX, s.robotY) < 50) {
        completeMiniGame();
    }

    if (s.hits > 100) failMiniGame("The rover took too many bumps. Try a safer path.");
}

function drawRover() {
    drawMoonBackground();

    const s = missionState;

    s.rocks.forEach(rock => {
        ctx.fillStyle = "#626c82";
        ctx.beginPath();
        ctx.arc(rock.x, rock.y, rock.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#aab5c9";
        ctx.lineWidth = 4;
        ctx.stroke();
    });

    drawText("🤖", s.robotX - 20, s.robotY + 20, "white", 35);
    drawText("RESCUE ME!", s.robotX - 50, s.robotY - 30, "#ffe17a", 13);

    drawRoverSprite(s.x, s.y);

    drawText("ROCK HITS: " + Math.floor(s.hits / 30), 25, 35, "#ffe17a", 18);
}

/* =========================================================
   9. MISSION 3 — OXYGEN COLLECTION
========================================================= */

function setupOxygen() {
    missionState = {
        x: 80,
        y: 280,
        collected: 0,
        time: 45,
        tanks: Array.from({ length: 8 }, () => ({
            x: 100 + Math.random() * 800,
            y: 120 + Math.random() * 330,
            taken: false
        }))
    };
}

function updateOxygen(dt) {
    const s = missionState;
    moveMiniPlayer(s, dt, 240);

    s.time -= dt;

    s.tanks.forEach(tank => {
        if (!tank.taken && distance(s.x, s.y, tank.x, tank.y) < 35) {
            tank.taken = true;
            s.collected++;
            oxygen = Math.min(100, oxygen + 4);
            score += 20;
            playSound("collect");
        }
    });

    if (s.collected >= 8) completeMiniGame();
    if (s.time <= 0) failMiniGame("You ran out of time. Collect the oxygen tanks faster!");
}

function drawOxygen() {
    drawMoonBackground();

    const s = missionState;

    s.tanks.forEach(tank => {
        if (!tank.taken) {
            drawText("🫁", tank.x - 15, tank.y + 12, "white", 30);
        }
    });

    drawAstronaut(s.x, s.y);

    drawText("OXYGEN TANKS: " + s.collected + " / 8", 25, 35, "#7ceaff", 18);
    drawText("TIME: " + Math.ceil(s.time), 25, 65, "#ffe17a", 18);
}

/* =========================================================
   10. MISSION 4 — WIRING PUZZLE
========================================================= */

function setupWiring() {
    missionState = {
        connected: 0,
        nodes: [
            { x: 150, y: 160 },
            { x: 330, y: 360 },
            { x: 500, y: 160 },
            { x: 680, y: 360 },
            { x: 850, y: 160 }
        ],
        mistakes: 0
    };
}

function drawWiring() {
    drawSpaceBackground();

    const s = missionState;

    ctx.strokeStyle = "#48567e";
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(s.nodes[0].x, s.nodes[0].y);
    ctx.lineTo(s.nodes[4].x, s.nodes[4].y);
    ctx.stroke();

    for (let i = 0; i < s.connected; i++) {
        ctx.strokeStyle = "#5df4c2";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(s.nodes[i].x, s.nodes[i].y);
        ctx.lineTo(s.nodes[i + 1].x, s.nodes[i + 1].y);
        ctx.stroke();
    }

    s.nodes.forEach((node, i) => {
        ctx.fillStyle = i <= s.connected ? "#39d9a1" : "#344b83";
        ctx.beginPath();
        ctx.arc(node.x, node.y, 34, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#d5f6ff";
        ctx.lineWidth = 3;
        ctx.stroke();

        drawText(String(i + 1), node.x - 7, node.y + 8, "white", 22);
    });

    drawText("POWER CONNECTION", 330, 55, "#ffe17a", 22);
    drawText("CONNECTED: " + s.connected + " / 5", 25, 510, "#7ceaff", 18);
    drawText("CLICK STATION " + Math.min(5, s.connected + 1), 650, 510, "white", 16);
}

function clickWiring(x, y) {
    const s = missionState;
    const expected = s.nodes[s.connected];

    if (distance(x, y, expected.x, expected.y) < 45) {
        s.connected++;
        score += 25;
        playSound("repair");

        if (s.connected >= 5) completeMiniGame();
    } else {
        s.mistakes++;
        playSound("warning");
        setMessage("That is not the next station. Follow the numbers!");
    }
}

/* =========================================================
   11. MISSION 5 — SCIENCE SAMPLES
========================================================= */

function setupSamples() {
    missionState = {
        found: 0,
        clueIndex: 0,
        options: [],
        correct: 0
    };

    createSampleRound();
}

function createSampleRound() {
    const s = missionState;

    const clues = [
        { clue: "Find the rock with ICE!", answer: "ICE" },
        { clue: "Find the rock with a METAL shine!", answer: "METAL" },
        { clue: "Find the rock with tiny CRYSTALS!", answer: "CRYSTAL" }
    ];

    s.currentClue = clues[s.clueIndex];
    const types = ["ICE", "METAL", "CRYSTAL", "DUST"];
    s.options = types.sort(() => Math.random() - 0.5).map((type, i) => ({
        x: 160 + i * 225,
        y: 290,
        type,
        correct: type === s.currentClue.answer
    }));
}

function drawSamples() {
    drawSpaceBackground();

    const s = missionState;

    drawText("SCIENCE LAB", 360, 60, "#ffe17a", 24);
    drawText(s.currentClue.clue, 210, 150, "#8ce9ff", 22);

    s.options.forEach(option => {
        ctx.fillStyle = option.type === "ICE" ? "#8deaff" :
            option.type === "METAL" ? "#c2cbd8" :
            option.type === "CRYSTAL" ? "#bd8cff" : "#a38b6b";

        ctx.beginPath();
        ctx.moveTo(option.x - 45, option.y + 20);
        ctx.lineTo(option.x - 30, option.y - 25);
        ctx.lineTo(option.x + 15, option.y - 40);
        ctx.lineTo(option.x + 50, option.y + 5);
        ctx.lineTo(option.x + 20, option.y + 40);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.stroke();

        drawText("?", option.x - 7, option.y + 8, "#182342", 24);
    });

    drawText("SAMPLES FOUND: " + s.found + " / 3", 25, 35, "#7ceaff", 18);
    drawText("CLICK THE RIGHT ROCK", 340, 460, "white", 18);
}

function clickSamples(x, y) {
    const s = missionState;
    const option = s.options.find(o => distance(x, y, o.x, o.y) < 65);

    if (!option) return;

    if (option.correct) {
        s.found++;
        s.clueIndex++;
        science += 1;
        score += 50;
        playSound("collect");

        if (s.found >= 3) {
            completeMiniGame();
        } else {
            createSampleRound();
        }
    } else {
        energy = Math.max(0, energy - 4);
        playSound("warning");
        setMessage("Not quite! Read the science clue again.");
    }
}

/* =========================================================
   12. MISSION 6 — HABITAT BUILDING
========================================================= */

function setupBuilding() {
    missionState = {
        placed: 0,
        parts: [
            { name: "FOUNDATION", emoji: "🧱", x: 170, y: 330 },
            { name: "WALLS", emoji: "🧩", x: 330, y: 330 },
            { name: "ROOF", emoji: "🏠", x: 490, y: 330 },
            { name: "AIR SYSTEM", emoji: "🫁", x: 650, y: 330 },
            { name: "SOLAR POWER", emoji: "☀️", x: 810, y: 330 }
        ]
    };
}

function drawBuilding() {
    drawSpaceBackground();

    const s = missionState;

    drawText("BUILD YOUR LUNAR HOME", 280, 65, "#ffe17a", 22);
    drawText("BUILDING ORDER: FOUNDATION → WALLS → ROOF → AIR → POWER", 100, 120, "#a8eaff", 13);

    ctx.fillStyle = "#263b69";
    ctx.fillRect(120, 420, 760, 8);

    s.parts.forEach((part, i) => {
        if (i < s.placed) {
            ctx.fillStyle = "#48cda1";
            ctx.fillRect(120 + i * 155, 390, 145, 12);
            drawText("✓", 180 + i * 155, 375, "#8cffbd", 24);
        }

        ctx.fillStyle = i === s.placed ? "#344f88" : "#222e51";
        ctx.fillRect(part.x - 55, part.y - 55, 110, 110);

        ctx.strokeStyle = i === s.placed ? "#ffe17a" : "#60739c";
        ctx.lineWidth = 3;
        ctx.strokeRect(part.x - 55, part.y - 55, 110, 110);

        drawText(part.emoji, part.x - 20, part.y + 12, "white", 32);
        drawText(part.name, part.x - 55, part.y + 85, "white", 11);
    });

    drawText("PARTS PLACED: " + s.placed + " / 5", 25, 35, "#7ceaff", 18);
    drawText("CLICK THE NEXT PART", 370, 510, "white", 16);
}

function clickBuilding(x, y) {
    const s = missionState;
    const part = s.parts[s.placed];

    if (!part) return;

    if (distance(x, y, part.x, part.y) < 75) {
        s.placed++;
        score += 25;
        playSound("repair");

        if (s.placed >= 5) completeMiniGame();
    } else {
        playSound("warning");
        setMessage("Build in order! Find the highlighted part.");
    }
}

/* =========================================================
   13. MISSION 7 — SOLAR STORM
========================================================= */

function setupStorm() {
    missionState = {
        x: 80,
        y: 450,
        shelterX: 870,
        shelterY: 450,
        time: 35,
        hazards: [],
        spawn: 0
    };
}

function updateStorm(dt) {
    const s = missionState;
    moveMiniPlayer(s, dt, 250);

    s.time -= dt;
    s.spawn += dt;

    if (s.spawn > 0.8) {
        s.spawn = 0;
        s.hazards.push({
            x: Math.random() * W,
            y: -20,
            speed: 180 + Math.random() * 120,
            size: 10 + Math.random() * 12
        });
    }

    s.hazards.forEach(h => {
        h.y += h.speed * dt;

        if (distance(s.x, s.y, h.x, h.y) < h.size + 20) {
            h.y = H + 50;
            health = Math.max(0, health - 5);
            radiation = Math.min(100, radiation + 5);
            playSound("warning");
        }
    });

    s.hazards = s.hazards.filter(h => h.y < H + 30);

    if (distance(s.x, s.y, s.shelterX, s.shelterY) < 60) {
        completeMiniGame();
    }

    if (s.time <= 0) failMiniGame("The solar storm arrived. Try reaching shelter sooner!");
}

function drawStorm() {
    drawMoonBackground();

    const s = missionState;

    ctx.fillStyle = "rgba(255,100,60,.16)";
    ctx.fillRect(0, 0, W, H);

    s.hazards.forEach(h => {
        ctx.fillStyle = "#ff8a50";
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffe4a3";
        ctx.beginPath();
        ctx.arc(h.x - 3, h.y - 3, h.size / 3, 0, Math.PI * 2);
        ctx.fill();
    });

    drawText("🛡️", s.shelterX - 20, s.shelterY + 20, "white", 50);
    drawText("SAFE SHELTER", s.shelterX - 65, s.shelterY - 35, "#8dffbf", 14);

    drawAstronaut(s.x, s.y);

    drawText("STORM ARRIVES IN: " + Math.ceil(s.time), 25, 35, "#ffbc7a", 18);
}

/* =========================================================
   14. MISSION 8 — ANTENNA SIGNAL
========================================================= */

function setupSignal() {
    missionState = {
        angle: 0,
        target: 35,
        connected: 0,
        timer: 45
    };
}

function updateSignal(dt) {
    const s = missionState;

    s.timer -= dt;

    if (keys["arrowleft"] || keys["a"]) s.angle -= 65 * dt;
    if (keys["arrowright"] || keys["d"]) s.angle += 65 * dt;

    s.angle = Math.max(-90, Math.min(90, s.angle));

    if (s.timer <= 0) failMiniGame("The signal window closed. Try again!");
}

function drawSignal() {
    drawSpaceBackground();

    const s = missionState;

    drawText("MISSION CONTROL SIGNAL", 280, 55, "#ffe17a", 22);
    drawText("AIM THE ANTENNA INTO THE GREEN ZONE", 250, 105, "#a8eaff", 15);

    ctx.fillStyle = "#536783";
    ctx.fillRect(455, 370, 90, 80);

    ctx.save();
    ctx.translate(500, 370);
    ctx.rotate(s.angle * Math.PI / 180);

    ctx.strokeStyle = "#e3eaff";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -180);
    ctx.stroke();

    ctx.fillStyle = "#ffe17a";
    ctx.beginPath();
    ctx.arc(0, -180, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Signal target indicator
    ctx.fillStyle = "#39e7a5";
    ctx.fillRect(350, 480, 300, 13);

    ctx.fillStyle = "#ffe17a";
    ctx.fillRect(350 + (s.target + 90) / 180 * 300 - 8, 472, 16, 30);

    drawText("SIGNAL: " + s.connected + " / 3", 25, 35, "#7ceaff", 18);
    drawText("ANGLE: " + Math.round(s.angle) + "°", 25, 70, "white", 17);
    drawText("TIME: " + Math.ceil(s.timer), 820, 35, "#ffe17a", 18);
    drawText("PRESS SPACE TO SEND", 370, 535, "white", 15);
}

function sendSignal() {
    const s = missionState;

    if (Math.abs(s.angle - s.target) <= 8) {
        s.connected++;
        score += 40;
        playSound("collect");

        if (s.connected >= 3) {
            completeMiniGame();
        } else {
            s.target = [-55, -25, 15, 55, 70][Math.floor(Math.random() * 5)];
            setMessage("Signal connected! Find the next angle.");
        }
    } else {
        energy = Math.max(0, energy - 3);
        playSound("warning");
        setMessage("Not quite! Move the antenna into the green zone.");
    }
}

/* =========================================================
   15. MISSION 9 — BASE EMERGENCY
========================================================= */

function setupEmergency() {
    missionState = {
        repaired: 0,
        time: 40,
        systems: [
            { name: "OXYGEN", emoji: "🫁", x: 200, y: 270 },
            { name: "POWER", emoji: "⚡", x: 500, y: 270 },
            { name: "WATER", emoji: "💧", x: 800, y: 270 }
        ],
        order: ["OXYGEN", "POWER", "WATER"]
    };
}

function updateEmergency(dt) {
    const s = missionState;
    s.time -= dt;

    if (s.time <= 0) failMiniGame("The emergency timer ran out. Try repairing the systems faster!");
}

function drawEmergency() {
    drawSpaceBackground();

    const s = missionState;

    drawText("BASE EMERGENCY CONTROL", 270, 55, "#ffdb7b", 22);
    drawText("REPAIR IN THIS ORDER: OXYGEN → POWER → WATER", 190, 110, "#a8eaff", 15);

    s.systems.forEach((system, i) => {
        ctx.fillStyle = i < s.repaired ? "#236f5b" : "#743b55";
        ctx.fillRect(system.x - 80, system.y - 65, 160, 130);

        ctx.strokeStyle = i < s.repaired ? "#7dffc2" : "#ff9aa9";
        ctx.lineWidth = 4;
        ctx.strokeRect(system.x - 80, system.y - 65, 160, 130);

        drawText(system.emoji, system.x - 22, system.y + 10, "white", 35);
        drawText(system.name, system.x - 40, system.y + 50, "white", 14);
        drawText(i < s.repaired ? "FIXED ✓" : "BROKEN!", system.x - 38, system.y + 90,
            i < s.repaired ? "#8dffbd" : "#ffb4b4", 12);
    });

    drawText("REPAIRED: " + s.repaired + " / 3", 25, 35, "#7ceaff", 18);
    drawText("TIME: " + Math.ceil(s.time), 830, 35, "#ffe17a", 18);
}

function clickEmergency(x, y) {
    const s = missionState;
    const system = s.systems[s.repaired];

    if (!system) return;

    if (Math.abs(x - system.x) < 85 && Math.abs(y - system.y) < 75) {
        s.repaired++;
        score += 40;
        playSound("repair");

        if (s.repaired >= 3) completeMiniGame();
    } else {
        energy = Math.max(0, energy - 3);
        playSound("warning");
        setMessage("Repair the systems in the correct order!");
    }
}

/* =========================================================
   16. MISSION 10 — RETURN TO EARTH
========================================================= */

function setupLaunch() {
    missionState = {
        steps: [
            { label: "CHECK OXYGEN", key: "O" },
            { label: "CHECK POWER", key: "P" },
            { label: "LOCK HATCH", key: "H" },
            { label: "START ENGINE", key: "E" },
            { label: "LAUNCH!", key: "L" }
        ],
        step: 0,
        countdown: 15
    };
}

function drawLaunch() {
    drawSpaceBackground();

    const s = missionState;

    drawText("RETURN TO EARTH", 350, 55, "#ffe17a", 24);
    drawText("FINAL SPACECRAFT CHECKLIST", 330, 110, "#a8eaff", 16);

    s.steps.forEach((step, i) => {
        const y = 170 + i * 65;

        ctx.fillStyle = i < s.step ? "#23735c" :
            i === s.step ? "#3b548b" : "#202a49";

        ctx.fillRect(230, y - 30, 540, 48);

        ctx.strokeStyle = i === s.step ? "#ffe17a" : "#6579a7";
        ctx.lineWidth = 3;
        ctx.strokeRect(230, y - 30, 540, 48);

        drawText(
            i < s.step ? "✓ " + step.label :
                (i === s.step ? "▶ " + step.label : "○ " + step.label),
            270, y, i < s.step ? "#8cffbd" : "white", 17
        );

        drawText("[" + step.key + "]", 680, y, "#ffe17a", 17);
    });

    drawText("CHECKLIST: " + s.step + " / 5", 25, 35, "#7ceaff", 18);
    drawText("PRESS THE KEY SHOWN!", 340, 535, "#ffe17a", 18);
}

function pressLaunchKey(key) {
    const s = missionState;
    const step = s.steps[s.step];

    if (!step) return;

    if (key.toUpperCase() === step.key) {
        s.step++;
        score += 50;
        playSound("repair");

        if (s.step >= s.steps.length) {
            playSound("launch");
            setTimeout(() => completeMiniGame(), 700);
        }
    } else {
        energy = Math.max(0, energy - 2);
        playSound("warning");
        setMessage("Wrong button! Follow the checklist from top to bottom.");
    }
}

/* =========================================================
   17. DRAWING HELPERS
========================================================= */

function drawSpaceBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "#0a1030");
    gradient.addColorStop(1, "#25264b");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 65; i++) {
        const x = (i * 137) % W;
        const y = (i * 83) % H;

        ctx.fillStyle = i % 3 === 0 ? "#78dfff" : "#ffffff";
        ctx.globalAlpha = 0.35 + (i % 5) * 0.12;
        ctx.fillRect(x, y, 2, 2);
    }

    ctx.globalAlpha = 1;
}

function drawMoonBackground() {
    drawSpaceBackground();

    ctx.fillStyle = "#727d94";
    ctx.fillRect(0, 470, W, 90);

    ctx.fillStyle = "#9ba8b9";
    ctx.fillRect(0, 470, W, 7);

    for (let i = 0; i < 15; i++) {
        const x = (i * 83) % W;
        ctx.fillStyle = "#5c657c";
        ctx.beginPath();
        ctx.ellipse(x, 495 + (i % 3) * 12, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawText(text, x, y, color = "white", size = 18) {
    ctx.font = `bold ${size}px Arial`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

function drawAstronaut(x, y) {
    ctx.save();

    ctx.fillStyle = "rgba(0,0,0,.3)";
    ctx.beginPath();
    ctx.ellipse(x, y + 24, 20, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = suitColors[suit] || suitColors.cyan;
    ctx.fillRect(x - 12, y - 5, 24, 26);

    ctx.fillStyle = "#e9f6ff";
    ctx.beginPath();
    ctx.arc(x, y - 14, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#31567e";
    ctx.beginPath();
    ctx.ellipse(x, y - 14, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#e6ad61";
    ctx.fillRect(x - 20, y - 4, 7, 23);

    ctx.fillStyle = "#26344e";
    ctx.fillRect(x - 12, y + 18, 9, 9);
    ctx.fillRect(x + 3, y + 18, 9, 9);

    ctx.restore();
}

function drawShip(x, y) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = "#d7e6f4";
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(40, 50);
    ctx.lineTo(20, 43);
    ctx.lineTo(0, 50);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#47bde8";
    ctx.beginPath();
    ctx.arc(20, 25, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ff9d53";
    ctx.fillRect(10, 48, 7, 12);
    ctx.fillRect(24, 48, 7, 12);

    if (keys[" "]) {
        ctx.fillStyle = "#ffdb69";
        ctx.beginPath();
        ctx.moveTo(10, 58);
        ctx.lineTo(20, 90 + Math.random() * 15);
        ctx.lineTo(30, 58);
        ctx.fill();
    }

    ctx.restore();
}

function drawRoverSprite(x, y) {
    ctx.fillStyle = "#d4a95c";
    ctx.fillRect(x, y, 45, 25);

    ctx.fillStyle = "#a9eaff";
    ctx.fillRect(x + 8, y - 12, 24, 13);

    ctx.fillStyle = "#17223f";
    ctx.beginPath();
    ctx.arc(x + 8, y + 27, 7, 0, Math.PI * 2);
    ctx.arc(x + 36, y + 27, 7, 0, Math.PI * 2);
    ctx.fill();
}

function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function moveMiniPlayer(s, dt, speed) {
    if (keys["arrowup"] || keys["w"]) s.y -= speed * dt;
    if (keys["arrowdown"] || keys["s"]) s.y += speed * dt;
    if (keys["arrowleft"] || keys["a"]) s.x -= speed * dt;
    if (keys["arrowright"] || keys["d"]) s.x += speed * dt;

    s.x = Math.max(25, Math.min(W - 25, s.x));
    s.y = Math.max(90, Math.min(H - 30, s.y));
}

/* =========================================================
   18. GAME LOOP
========================================================= */

function gameLoop(timestamp) {
    if (!running || paused) return;

    const dt = Math.min((timestamp - lastTime) / 1000, 0.04);
    lastTime = timestamp;
    missionTime += dt;

    updateCurrentMission(dt);
    drawCurrentMission();

    updateMessage(dt);
    updateHUD();

    if (running) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

function updateCurrentMission(dt) {
    const type = missions[currentDay - 1].type;

    if (type === "landing") updateLanding(dt);
    if (type === "rover") updateRover(dt);
    if (type === "oxygen") updateOxygen(dt);
    if (type === "storm") updateStorm(dt);
    if (type === "signal") updateSignal(dt);
    if (type === "emergency") updateEmergency(dt);

    if (type === "launch") {
        missionState.countdown -= dt;
        if (missionState.countdown <= 0) {
            failMiniGame("The launch checklist took too long. Try again!");
        }
    }
}

function drawCurrentMission() {
    const type = missions[currentDay - 1].type;

    ctx.clearRect(0, 0, W, H);

    if (type === "landing") drawLanding();
    if (type === "rover") drawRover();
    if (type === "oxygen") drawOxygen();
    if (type === "wiring") drawWiring();
    if (type === "samples") drawSamples();
    if (type === "building") drawBuilding();
    if (type === "storm") drawStorm();
    if (type === "signal") drawSignal();
    if (type === "emergency") drawEmergency();
    if (type === "launch") drawLaunch();
}

/* =========================================================
   19. INPUT — KEYBOARD AND MOUSE
========================================================= */

document.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();

    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
        event.preventDefault();
    }

    keys[key] = true;

    if (key === "escape" || key === "p") {
        togglePause();
    }

    if (!running || paused || completed) return;

    if (missions[currentDay - 1].type === "signal" && key === " ") {
        sendSignal();
    }

    if (missions[currentDay - 1].type === "launch") {
        pressLaunchKey(key);
    }
});

document.addEventListener("keyup", event => {
    keys[event.key.toLowerCase()] = false;
});

canvas.addEventListener("click", event => {
    if (!running || paused || completed) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (W / rect.width);
    const y = (event.clientY - rect.top) * (H / rect.height);

    const type = missions[currentDay - 1].type;

    if (type === "wiring") clickWiring(x, y);
    if (type === "samples") clickSamples(x, y);
    if (type === "building") clickBuilding(x, y);
    if (type === "emergency") clickEmergency(x, y);
});

/* =========================================================
   20. PAUSE AND MESSAGES
========================================================= */

function togglePause() {
    if (!running && !paused) return;

    paused = !paused;

    const overlay = document.getElementById("pause-overlay");

    if (overlay) {
        overlay.classList.toggle("show", paused);
        overlay.style.display = paused ? "flex" : "none";
    }

    if (paused) {
        running = false;
        if (animationId) cancelAnimationFrame(animationId);
    } else {
        running = true;
        lastTime = performance.now();
        animationId = requestAnimationFrame(gameLoop);
    }

    playSound("click");
}

function setMessage(text) {
    message = text;
    messageTimer = 3;

    const element = document.getElementById("game-message");
    if (element) {
        element.textContent = text;
        element.style.opacity = "1";
    }
}

function updateMessage(dt) {
    if (messageTimer > 0) {
        messageTimer -= dt;

        if (messageTimer <= 0) {
            const element = document.getElementById("game-message");
            if (element) element.style.opacity = "0";
        }
    }
}

/* =========================================================
   21. HUD
========================================================= */

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function updateHUD() {
    setText("oxygen-value", Math.round(oxygen));
    setText("energy-value", Math.round(energy));
    setText("health-value", Math.round(health));
    setText("radiation-value", Math.round(radiation));
    setText("sample-value", science + "/10");

    setText("score", String(score).padStart(6, "0"));

    const astro = document.getElementById("astro-message");
    if (astro) {
        astro.textContent = "ASTRO: " + playerName + ", you've got this!";
    }
}

function updateDayLabel() {
    setText("mission-day", "MISSION DAY " + String(currentDay).padStart(2, "0"));
}

function updateObjectives() {
    const mission = missions[currentDay - 1];

    setText("objective-crates", "★ " + (mission ? mission.title : "Campaign complete"));
    setText("objective-solar", "★ " + (mission ? mission.instructions : "Well done!"));
    setText("objective-habitat", "★ " + (mission ? mission.goal : "All missions completed"));
    setText("objective-samples", "★ Mission " + currentDay + " of 10");
}

/* =========================================================
   22. CAMPAIGN RESULTS
========================================================= */

function finishCampaign() {
    running = false;
    paused = false;

    if (animationId) cancelAnimationFrame(animationId);

    // Close the final quiz/mission overlay before showing the results screen.
    hideOverlay();
    showScreen("result-screen");

    setText("result-heading", "🌍 ALL 10 MISSIONS COMPLETE!");
    setText(
        "result-message",
        "Congratulations, " + playerName +
        "! You completed every one of the 10 lunar missions and all the learning challenges. You are now a Junior Astronaut!"
    );

    setText("final-science", score);
    setText("final-days", "10");
    setText("final-health", Math.round(health) + "%");

    playSound("launch");
}

function finishMission(success) {
    if (success) {
        finishCampaign();
        return;
    }

    running = false;

    showOverlay(`
        <div style="font-size:45px">👨‍🚀</div>
        <h2>MISSION ENDED</h2>
        <p>Your adventure has stopped. You can start again whenever you are ready.</p>
        <button id="restart-campaign">RESTART</button>
        <button id="back-home">HOME</button>
    `);

    document.getElementById("restart-campaign").onclick = () => {
        currentDay = 1;
        score = 0;
        science = 0;
        health = 100;
        oxygen = 100;
        energy = 100;
        radiation = 0;
        startMission();
    };

    document.getElementById("back-home").onclick = () => {
        hideOverlay();
        showScreen("home-screen");
    };
}

/* =========================================================
   24. INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    createExtraControls();
    updateHUD();

    // Start browser audio after the first user click.
    document.addEventListener("click", unlockSound, { once: true });
});

/* Functions used by HTML onclick buttons */
window.startGame = startGame;
window.showProfile = showProfile;
window.showInstructions = showInstructions;
window.showAbout = showAbout;
window.goHome = goHome;
window.showScreen = showScreen;
window.selectSuit = selectSuit;
window.selectDifficulty = selectDifficulty;
window.saveProfile = saveProfile;
window.enterBase = enterBase;
window.startMission = startMission;
window.togglePause = togglePause;
window.finishMission = finishMission;
window.toggleSound = toggleSound;
