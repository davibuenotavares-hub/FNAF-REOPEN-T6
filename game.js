const state = {
    doorClosed: false, windowClosed: false, monitorOpen: false,
    temperature: 25, isCooling: false, currentCam: 1,
    hour: 0, power: 100,
    freddyPos: 6, babyPos: 6, springPos: 6,
    babyTimer: 0, isRecharging: false
};

// --- MECÂNICA DE ESPIAR (CLICAR NA PORTA/JANELA) ---
function checkProximity(place) {
    const status = document.getElementById('office-status');
    if (place === 'door') {
        if (state.freddyPos === 0 || state.springPos === 0) {
            status.innerText = "ALERTA: " + (state.freddyPos === 0 ? "FREDDY" : "SPRINGBONNIE") + " ESTÁ NA PORTA!";
            status.style.color = "red";
        } else {
            status.innerText = "NADA NA PORTA";
            status.style.color = "#0f0";
        }
    }
    if (place === 'window') {
        if (state.babyPos === 0) {
            status.innerText = "ALERTA: BABY ESTÁ NA JANELA!";
            status.style.color = "red";
        } else {
            status.innerText = "NADA NA JANELA";
            status.style.color = "#0f0";
        }
    }
    setTimeout(() => { status.innerText = "SISTEMAS OK"; status.style.color = "white"; }, 2000);
}

// --- CONTROLES DE BOTÃO ---
document.getElementById('btn-door-action').onclick = () => {
    state.doorClosed = !state.doorClosed;
    document.getElementById('door-right').classList.toggle('closed');
};
document.getElementById('btn-window-action').onclick = () => {
    state.windowClosed = !state.windowClosed;
    document.getElementById('window').classList.toggle('closed');
};
document.getElementById('btn-open-monitor').onclick = () => {
    state.monitorOpen = true;
    document.getElementById('camera-monitor').style.display = 'flex';
};
document.getElementById('btn-close-cam').onclick = () => {
    state.monitorOpen = false;
    state.isRecharging = false;
    document.getElementById('camera-monitor').style.display = 'none';
};

// Temperatura (Pressionar e soltar)
document.getElementById('btn-temp-down').onpointerdown = () => state.isCooling = true;
document.getElementById('btn-temp-up').onpointerdown = () => state.isCooling = false;

// Elementos na tela da câmera
const audioBtn = document.getElementById('btn-audio-center');
const rechargeBtn = document.getElementById('btn-recharge');

audioBtn.onclick = () => {
    state.springPos = Math.min(6, state.currentCam + 1); // Atrai para a câmera atual
    audioBtn.style.background = "rgba(0,255,0,0.5)";
    setTimeout(() => audioBtn.style.background = "rgba(0,255,0,0.1)", 300);
};

rechargeBtn.onpointerdown = () => { state.isRecharging = true; rechargeBtn.style.background = "#0f0"; };
rechargeBtn.onpointerup = () => { state.isRecharging = false; rechargeBtn.style.background = "rgba(0,255,0,0.1)"; };

document.querySelectorAll('.cam-btn').forEach(btn => {
    btn.onclick = (e) => {
        state.currentCam = parseInt(e.target.dataset.cam);
        document.getElementById('cam-name').innerText = "CAM 0" + state.currentCam;
        
        // Regra da Câmera 4
        rechargeBtn.style.display = (state.currentCam === 4) ? "block" : "none";
        audioBtn.style.display = (state.currentCam !== 4) ? "block" : "none";
        
        updateMotionAlert();
    };
});

function updateMotionAlert() {
    let anims = [];
    if (state.freddyPos == state.currentCam) anims.push("FREDDY");
    if (state.babyPos == state.currentCam) anims.push("BABY");
    if (state.springPos == state.currentCam) anims.push("SPRINGBONNIE");
    document.getElementById('motion-alert').innerText = anims.length > 0 ? "MOVIMENTO: " + anims.join("/") : "NENHUM MOVIMENTO";
}

// --- LOOP PRINCIPAL (1 SEGUNDO) ---
setInterval(() => {
    // 1. Temperatura
    state.temperature += state.isCooling ? -1.5 : 0.5;
    document.getElementById('temp-display').innerText = `TEMP: ${Math.floor(state.temperature)}°C`;
    
    // 2. Energia
    if (state.isRecharging && state.monitorOpen && state.currentCam === 4) {
        state.power = Math.min(100, state.power + 2.5);
    } else {
        let drain = 0.05 + (state.doorClosed ? 0.25 : 0) + (state.windowClosed ? 0.25 : 0);
        state.power -= drain;
    }
    document.getElementById('power-display').innerText = `BATERIA: ${Math.floor(state.power)}%`;
    if (state.power <= 0) gameOver("FALTA DE ENERGIA");

    // 3. IA de Movimento (Lenta)
    if (Math.random() > 0.90) { // Freddy
        state.freddyPos = state.freddyPos > 0 ? state.freddyPos - 1 : (state.doorClosed ? 4 : 0);
        if (state.freddyPos === 0 && !state.doorClosed) gameOver("FREDDY");
    }

    if (Math.random() > 0.90) { // Springbonnie
        state.springPos = state.springPos > 0 ? state.springPos - 1 : (state.doorClosed ? 5 : 0);
        if (state.springPos === 0 && !state.doorClosed) gameOver("SPRINGBONNIE");
    }

    // 4. Mecânica da Baby (15 segundos na Janela)
    if (Math.random() > 0.94 && state.babyPos > 0) state.babyPos--;
    if (state.babyPos === 0) {
        state.babyTimer++;
        if (state.babyTimer >= 15) {
            if (state.temperature <= 10 || state.windowClosed) {
                state.babyPos = 4; // Ela vai embora
                state.babyTimer = 0;
            } else {
                gameOver("CIRCUS BABY");
            }
        }
    }

    if (state.monitorOpen) updateMotionAlert();
}, 1000);

// Relógio (1 min = 1h)
setInterval(() => {
    state.hour++;
    document.getElementById('clock').innerText = state.hour + " AM";
    if (state.hour >= 6) { alert("VENCEU A NOITE!"); location.reload(); }
}, 60000);

function gameOver(motive) { alert("JUMPSCARE: " + motive); location.reload(); }
