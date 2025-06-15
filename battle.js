// Battle-specific functionality and utilities
class BattleUtilities {
    constructor() {
        this.soundEffects = {
            airhorn: this.createAirhorn(),
            applause: this.createApplause(),
            boo: this.createBoo(),
            drumroll: this.createDrumroll()
        };
        this.battlePhrases = [
            "🔥 FIRE BARS! 🔥",
            "💯 STRAIGHT HEAT! 💯",
            "🎤 DROP THE MIC! 🎤",
            "⚡ ELECTRIC FLOW! ⚡",
            "🌟 LEGENDARY! 🌟",
            "💥 BOOM! 💥",
            "🚀 TO THE MOON! 🚀",
            "👑 CROWN THEM! 👑"
        ];
        this.crowdReactions = [
            "OHHHHH!",
            "DAYUM!",
            "SHEESH!",
            "BARS!",
            "FIRE!",
            "COLD!",
            "NASTY!",
            "SICK!"
        ];
    }

    // Create sound effects using Web Audio API
    createAirhorn() {
        return () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        };
    }

    createApplause() {
        return () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const bufferSize = audioContext.sampleRate * 2;
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2) * 0.1;
            }
            
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start();
        };
    }

    createBoo() {
        return () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(80, audioContext.currentTime + 1);
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1);
        };
    }

    createDrumroll() {
        return () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const bufferSize = audioContext.sampleRate * 3;
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                const frequency = 200 + Math.sin(i * 0.01) * 50;
                data[i] = Math.sin(frequency * i / audioContext.sampleRate) * 
                         Math.random() * 0.1 * (1 - i / bufferSize);
            }
            
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start();
        };
    }

    playRandomPhrase() {
        const phrase = this.battlePhrases[Math.floor(Math.random() * this.battlePhrases.length)];
        this.showFloatingText(phrase);
    }

    playRandomReaction() {
        const reaction = this.crowdReactions[Math.floor(Math.random() * this.crowdReactions.length)];
        this.showFloatingText(reaction, 'reaction');
    }

    showFloatingText(text, type = 'phrase') {
        const floatingText = document.createElement('div');
        floatingText.textContent = text;
        floatingText.style.cssText = `
            position: fixed;
            top: ${Math.random() * 30 + 20}%;
            left: ${Math.random() * 60 + 20}%;
            font-family: 'Orbitron', monospace;
            font-size: ${type === 'reaction' ? '2rem' : '1.5rem'};
            font-weight: 900;
            color: ${type === 'reaction' ? '#ff4444' : '#00ffff'};
            text-shadow: 0 0 20px ${type === 'reaction' ? '#ff4444' : '#00ffff'};
            z-index: 1000;
            pointer-events: none;
            animation: floatUp 3s ease-out forwards;
        `;

        // Add floating animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatUp {
                0% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                50% {
                    opacity: 1;
                    transform: translateY(-50px) scale(1.2);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-100px) scale(0.8);
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(floatingText);

        setTimeout(() => {
            if (floatingText.parentNode) {
                floatingText.parentNode.removeChild(floatingText);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 3000);
    }

    triggerCrowdReaction() {
        // Random chance for different reactions
        const rand = Math.random();
        
        if (rand < 0.3) {
            this.soundEffects.applause();
            this.playRandomPhrase();
        } else if (rand < 0.6) {
            this.playRandomReaction();
        } else if (rand < 0.8) {
            this.soundEffects.airhorn();
            this.showFloatingText("🔥🔥🔥", 'reaction');
        } else {
            this.soundEffects.drumroll();
        }
    }

    createBattleEffects() {
        // Add particle effects during battle
        const canvas = document.createElement('canvas');
        canvas.id = 'battle-effects';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10;
        `;
        
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        
        // Create particles
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`,
                alpha: Math.random() * 0.5 + 0.5
            });
        }
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around screen
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;
                
                // Draw particle
                ctx.save();
                ctx.globalAlpha = particle.alpha;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
            
            requestAnimationFrame(animate);
        }
        
        animate();
        
        return canvas;
    }

    removeBattleEffects() {
        const canvas = document.getElementById('battle-effects');
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
    }

    generateBattleName() {
        const adjectives = [
            'Epic', 'Legendary', 'Ultimate', 'Supreme', 'Intense',
            'Fierce', 'Savage', 'Brutal', 'Insane', 'Wild',
            'Crazy', 'Mad', 'Sick', 'Nasty', 'Fire'
        ];
        
        const nouns = [
            'Showdown', 'Clash', 'Battle', 'War', 'Duel',
            'Face-off', 'Throwdown', 'Beatdown', 'Smackdown',
            'Cypher', 'Session', 'Arena', 'Pit', 'Ring'
        ];
        
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        
        return `${adjective} ${noun}`;
    }

    generateRapperName() {
        const prefixes = [
            'MC', 'DJ', 'Lil', 'Big', 'Young', 'OG', 'King', 'Queen',
            'Boss', 'Chief', 'Lord', 'Sir', 'Lady', 'Master'
        ];
        
        const names = [
            'Thunder', 'Lightning', 'Storm', 'Blaze', 'Frost',
            'Shadow', 'Ghost', 'Phantom', 'Viper', 'Wolf',
            'Tiger', 'Dragon', 'Phoenix', 'Raven', 'Eagle',
            'Bullet', 'Rocket', 'Laser', 'Neon', 'Chrome'
        ];
        
        const suffixes = [
            'X', 'Z', '2K', '3000', 'Pro', 'Max', 'Ultra',
            'Prime', 'Elite', 'Supreme', 'Legendary', 'Epic'
        ];
        
        const usePrefix = Math.random() > 0.3;
        const useSuffix = Math.random() > 0.5;
        
        let rapperName = names[Math.floor(Math.random() * names.length)];
        
        if (usePrefix) {
            const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            rapperName = `${prefix} ${rapperName}`;
        }
        
        if (useSuffix) {
            const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
            rapperName = `${rapperName} ${suffix}`;
        }
        
        return rapperName;
    }

    createBattleIntro(players) {
        const introOverlay = document.createElement('div');
        introOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.7));
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            color: white;
            text-align: center;
            animation: fadeIn 1s ease-out;
        `;

        const battleName = this.generateBattleName();
        
        introOverlay.innerHTML = `
            <div style="font-family: 'Orbitron', monospace; font-size: 4rem; font-weight: 900; color: #ff0080; text-shadow: 0 0 40px #ff0080; margin-bottom: 2rem; animation: glow 2s ease-in-out infinite alternate;">
                ${battleName}
            </div>
            <div style="font-size: 2rem; color: #00ffff; margin-bottom: 3rem; text-shadow: 0 0 20px #00ffff;">
                ${AppState.battleFormat.toUpperCase()} RAP BATTLE
            </div>
            <div style="display: flex; gap: 3rem; margin-bottom: 3rem;">
                ${players.map(player => `
                    <div style="text-align: center;">
                        <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #00ffff, #ff0080); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 900;">
                            ${player.name.charAt(0).toUpperCase()}
                        </div>
                        <div style="font-size: 1.5rem; font-weight: 700; color: #ffffff;">
                            ${player.name}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="font-size: 1.2rem; opacity: 0.8; animation: pulse 2s ease-in-out infinite;">
                GET READY TO BATTLE!
            </div>
        `;

        // Add glow animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes glow {
                from { text-shadow: 0 0 40px #ff0080; }
                to { text-shadow: 0 0 60px #ff0080, 0 0 80px #ff0080; }
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.8); }
                to { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(introOverlay);

        // Play intro sound
        this.soundEffects.drumroll();

        return new Promise(resolve => {
            setTimeout(() => {
                document.body.removeChild(introOverlay);
                document.head.removeChild(style);
                resolve();
            }, 5000);
        });
    }

    addBattleHUD() {
        const hud = document.createElement('div');
        hud.id = 'battle-hud';
        hud.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            border: 1px solid #00ffff;
            border-radius: 12px;
            padding: 1rem;
            color: white;
            font-family: 'Rajdhani', sans-serif;
            z-index: 100;
            min-width: 200px;
        `;

        hud.innerHTML = `
            <div style="font-weight: 700; margin-bottom: 0.5rem; color: #00ffff;">BATTLE HUD</div>
            <div id="hud-round">Round: 1</div>
            <div id="hud-turn">Turn: 1</div>
            <div id="hud-energy" style="margin-top: 0.5rem;">
                <div style="font-size: 0.9rem; margin-bottom: 0.2rem;">Energy</div>
                <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; overflow: hidden;">
                    <div id="energy-bar" style="width: 100%; height: 100%; background: linear-gradient(90deg, #00ffff, #ff0080); transition: width 0.3s ease;"></div>
                </div>
            </div>
            <div id="hud-crowd" style="margin-top: 0.5rem;">
                <div style="font-size: 0.9rem; margin-bottom: 0.2rem;">Crowd Hype</div>
                <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; overflow: hidden;">
                    <div id="crowd-bar" style="width: 50%; height: 100%; background: linear-gradient(90deg, #ff4444, #ffaa00); transition: width 0.3s ease;"></div>
                </div>
            </div>
        `;

        document.body.appendChild(hud);
        return hud;
    }

    updateBattleHUD(round, turn, energy, crowdHype) {
        const hudRound = document.getElementById('hud-round');
        const hudTurn = document.getElementById('hud-turn');
        const energyBar = document.getElementById('energy-bar');
        const crowdBar = document.getElementById('crowd-bar');

        if (hudRound) hudRound.textContent = `Round: ${round}`;
        if (hudTurn) hudTurn.textContent = `Turn: ${turn}`;
        if (energyBar) energyBar.style.width = `${energy}%`;
        if (crowdBar) crowdBar.style.width = `${crowdHype}%`;
    }

    removeBattleHUD() {
        const hud = document.getElementById('battle-hud');
        if (hud && hud.parentNode) {
            hud.parentNode.removeChild(hud);
        }
    }

    simulateCrowdNoise() {
        // Simulate crowd reactions during battle
        const reactions = [
            () => this.triggerCrowdReaction(),
            () => this.playRandomPhrase(),
            () => this.playRandomReaction(),
            () => this.soundEffects.applause()
        ];

        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
        randomReaction();
    }

    startCrowdSimulation() {
        // Random crowd reactions during battle
        this.crowdInterval = setInterval(() => {
            if (AppState.battleState && AppState.battleState.isActive) {
                if (Math.random() < 0.3) { // 30% chance every 3 seconds
                    this.simulateCrowdNoise();
                }
            }
        }, 3000);
    }

    stopCrowdSimulation() {
        if (this.crowdInterval) {
            clearInterval(this.crowdInterval);
            this.crowdInterval = null;
        }
    }
}

// Global battle utilities instance
const battleUtils = new BattleUtilities();

// Enhanced battle initialization with intro
async function initializeEnhancedBattle() {
    console.log('Starting enhanced battle with intro...');
    
    // Show battle intro
    await battleUtils.createBattleIntro(AppState.players);
    
    // Add battle effects
    const effectsCanvas = battleUtils.createBattleEffects();
    
    // Add battle HUD
    const hud = battleUtils.addBattleHUD();
    
    // Start crowd simulation
    battleUtils.startCrowdSimulation();
    
    // Initialize the main battle system
    if (typeof initializeBattleScreen === 'function') {
        initializeBattleScreen();
    }
    
    // Update HUD periodically
    const hudUpdateInterval = setInterval(() => {
        if (AppState.battleState) {
            const round = AppState.battleState.currentRound || 1;
            const turn = (AppState.battleState.currentTurn || 0) + 1;
            const energy = Math.max(0, (AppState.battleState.timeRemaining / AppState.battleState.turnDuration) * 100);
            const crowdHype = Math.random() * 40 + 30; // Simulate crowd hype
            
            battleUtils.updateBattleHUD(round, turn, energy, crowdHype);
        }
    }, 1000);
    
    // Cleanup function
    window.cleanupBattleUtils = () => {
        battleUtils.removeBattleEffects();
        battleUtils.removeBattleHUD();
        battleUtils.stopCrowdSimulation();
        clearInterval(hudUpdateInterval);
    };
}

// Override the battle start to use enhanced version
const originalStartBattle = window.startBattle;
window.startBattle = function() {
    if (!canStartBattle()) {
        showNotification('Cannot start battle - not all players are ready', 'error');
        return;
    }
    
    showNotification('Battle starting...', 'success');
    playNotificationSound();
    
    setTimeout(() => {
        switchScreen('battle-screen');
        initializeEnhancedBattle();
    }, 1000);
};

// Add keyboard shortcuts for battle
document.addEventListener('keydown', (e) => {
    if (AppState.currentScreen === 'battle-screen') {
        switch(e.key.toLowerCase()) {
            case 'h':
                battleUtils.soundEffects.airhorn();
                battleUtils.showFloatingText('🔥 AIRHORN! 🔥', 'reaction');
                break;
            case 'a':
                battleUtils.soundEffects.applause();
                battleUtils.playRandomPhrase();
                break;
            case 'b':
                battleUtils.soundEffects.boo();
                battleUtils.showFloatingText('👎 BOO! 👎', 'reaction');
                break;
            case 'd':
                battleUtils.soundEffects.drumroll();
                break;
            case 'r':
                battleUtils.triggerCrowdReaction();
                break;
        }
    }
});

// Add battle tips
function showBattleTips() {
    const tips = [
        "Press 'H' for airhorn sound effect! 📯",
        "Press 'A' for applause! 👏",
        "Press 'B' to boo! 👎",
        "Press 'D' for drumroll! 🥁",
        "Press 'R' for random crowd reaction! 🎉"
    ];
    
    tips.forEach((tip, index) => {
        setTimeout(() => {
            showNotification(tip, 'info');
        }, index * 1000);
    });
}

// Show tips when battle screen loads
document.addEventListener('DOMContentLoaded', () => {
    // Show tips after a delay when battle starts
    let tipsShown = false;
    const originalSwitchScreen = window.switchScreen;
    
    window.switchScreen = function(screenId) {
        originalSwitchScreen(screenId);
        
        if (screenId === 'battle-screen' && !tipsShown) {
            setTimeout(() => {
                showBattleTips();
                tipsShown = true;
            }, 3000);
        }
    };
});

