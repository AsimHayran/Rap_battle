// WebRTC and Battle System Implementation
class WebRTCBattleSystem {
    constructor() {
        this.localStream = null;
        this.peerConnections = new Map();
        this.remoteStreams = new Map();
        this.isAudioEnabled = true;
        this.isVideoEnabled = true;
        this.isMuted = false;
        this.configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
    }

    async initializeMedia() {
        try {
            // Request user media with audio and video
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            console.log('Local media stream initialized');
            this.displayLocalVideo();
            return true;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            this.handleMediaError(error);
            return false;
        }
    }

    displayLocalVideo() {
        // Find the current user's video container
        const currentUserId = AppState.currentUser?.id;
        if (currentUserId) {
            const videoContainer = document.getElementById(`video-${currentUserId}`);
            if (videoContainer) {
                const existingVideo = videoContainer.querySelector('.video-element');
                if (existingVideo) {
                    // Replace the placeholder with actual video
                    const videoElement = document.createElement('video');
                    videoElement.className = 'video-element';
                    videoElement.srcObject = this.localStream;
                    videoElement.autoplay = true;
                    videoElement.muted = true; // Mute own video to prevent feedback
                    videoElement.playsInline = true;
                    
                    existingVideo.parentNode.replaceChild(videoElement, existingVideo);
                }
            }
        }
    }

    async createPeerConnection(peerId) {
        const peerConnection = new RTCPeerConnection(this.configuration);
        
        // Add local stream tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, this.localStream);
            });
        }

        // Handle remote stream
        peerConnection.ontrack = (event) => {
            console.log('Received remote stream from:', peerId);
            const remoteStream = event.streams[0];
            this.remoteStreams.set(peerId, remoteStream);
            this.displayRemoteVideo(peerId, remoteStream);
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                // In a real implementation, send this to the remote peer
                console.log('ICE candidate:', event.candidate);
            }
        };

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
            console.log(`Connection state with ${peerId}:`, peerConnection.connectionState);
        };

        this.peerConnections.set(peerId, peerConnection);
        return peerConnection;
    }

    displayRemoteVideo(peerId, stream) {
        const videoContainer = document.getElementById(`video-${peerId}`);
        if (videoContainer) {
            const existingVideo = videoContainer.querySelector('.video-element');
            if (existingVideo) {
                const videoElement = document.createElement('video');
                videoElement.className = 'video-element';
                videoElement.srcObject = stream;
                videoElement.autoplay = true;
                videoElement.playsInline = true;
                
                existingVideo.parentNode.replaceChild(videoElement, existingVideo);
            }
        }
    }

    handleMediaError(error) {
        let message = 'Unable to access camera/microphone. ';
        
        if (error.name === 'NotAllowedError') {
            message += 'Please allow camera and microphone permissions.';
        } else if (error.name === 'NotFoundError') {
            message += 'No camera or microphone found.';
        } else if (error.name === 'NotReadableError') {
            message += 'Camera or microphone is already in use.';
        } else {
            message += 'Please check your device settings.';
        }
        
        showNotification(message, 'error');
        
        // Create mock video streams for demo purposes
        this.createMockVideoStreams();
    }

    createMockVideoStreams() {
        console.log('Creating mock video streams for demo');
        
        AppState.players.forEach(player => {
            const videoContainer = document.getElementById(`video-${player.id}`);
            if (videoContainer) {
                const existingVideo = videoContainer.querySelector('.video-element');
                if (existingVideo && !existingVideo.tagName === 'VIDEO') {
                    // Keep the existing placeholder but add some animation
                    existingVideo.style.animation = 'pulse 2s ease-in-out infinite';
                }
            }
        });
    }

    toggleAudio() {
        if (this.localStream) {
            const audioTracks = this.localStream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            this.isAudioEnabled = !this.isAudioEnabled;
            
            const muteBtn = document.getElementById('mute-btn');
            if (muteBtn) {
                muteBtn.innerHTML = this.isAudioEnabled ? 
                    '<span class="btn-icon">🎤</span>' : 
                    '<span class="btn-icon">🔇</span>';
            }
            
            showNotification(this.isAudioEnabled ? 'Microphone enabled' : 'Microphone disabled', 'info');
        }
    }

    toggleVideo() {
        if (this.localStream) {
            const videoTracks = this.localStream.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            this.isVideoEnabled = !this.isVideoEnabled;
            
            const videoBtn = document.getElementById('video-btn');
            if (videoBtn) {
                videoBtn.innerHTML = this.isVideoEnabled ? 
                    '<span class="btn-icon">📹</span>' : 
                    '<span class="btn-icon">📷</span>';
            }
            
            showNotification(this.isVideoEnabled ? 'Camera enabled' : 'Camera disabled', 'info');
        }
    }

    muteAllExcept(activePlayerId) {
        // Mute all players except the active one
        AppState.players.forEach(player => {
            const videoContainer = document.getElementById(`video-${player.id}`);
            if (videoContainer) {
                const overlay = videoContainer.querySelector('.video-overlay');
                const statusElement = overlay?.querySelector('.video-status');
                
                if (player.id === activePlayerId) {
                    videoContainer.classList.remove('muted');
                    videoContainer.classList.add('active');
                    if (statusElement) {
                        statusElement.textContent = '🎤 RAPPING NOW';
                    }
                } else {
                    videoContainer.classList.remove('active');
                    videoContainer.classList.add('muted');
                    if (statusElement) {
                        statusElement.textContent = '🔇 MUTED';
                    }
                }
            }
        });
    }

    unmuteAll() {
        // Remove mute from all players
        AppState.players.forEach(player => {
            const videoContainer = document.getElementById(`video-${player.id}`);
            if (videoContainer) {
                videoContainer.classList.remove('muted', 'active');
                const overlay = videoContainer.querySelector('.video-overlay');
                const statusElement = overlay?.querySelector('.video-status');
                if (statusElement) {
                    statusElement.textContent = '🎤 READY';
                }
            }
        });
    }

    cleanup() {
        // Stop local stream
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        // Close all peer connections
        this.peerConnections.forEach(pc => pc.close());
        this.peerConnections.clear();
        this.remoteStreams.clear();
    }
}

// Enhanced Battle System with WebRTC Integration
class EnhancedBattleSystem {
    constructor() {
        this.webrtc = new WebRTCBattleSystem();
        this.battleTimer = null;
        this.turnTransitionTimer = null;
        this.audioContext = null;
        this.analyser = null;
        this.visualizerActive = false;
    }

    async initializeBattle() {
        console.log('Initializing enhanced battle system...');
        
        // Initialize WebRTC
        const mediaInitialized = await this.webrtc.initializeMedia();
        
        if (mediaInitialized) {
            showNotification('Camera and microphone ready!', 'success');
            this.setupAudioVisualizer();
        } else {
            showNotification('Using demo mode - no real video/audio', 'warning');
        }

        // Setup battle controls
        this.setupEnhancedControls();
        
        // Initialize battle state if not already done
        if (!AppState.battleState) {
            AppState.battleState = {
                currentRound: 1,
                totalRounds: AppState.battleFormat === '1v1' ? 2 : 4,
                currentTurn: 0,
                turnDuration: 120, // 2 minutes
                timeRemaining: 120,
                isActive: false,
                votes: {},
                battleOrder: [...AppState.players],
                turnHistory: []
            };
        }

        return true;
    }

    setupAudioVisualizer() {
        if (this.webrtc.localStream) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const source = this.audioContext.createMediaStreamSource(this.webrtc.localStream);
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 256;
                source.connect(this.analyser);
                
                console.log('Audio visualizer initialized');
            } catch (error) {
                console.error('Error setting up audio visualizer:', error);
            }
        }
    }

    setupEnhancedControls() {
        const muteBtn = document.getElementById('mute-btn');
        const videoBtn = document.getElementById('video-btn');
        const endBattleBtn = document.getElementById('end-battle-btn');

        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                this.webrtc.toggleAudio();
            });
        }

        if (videoBtn) {
            videoBtn.addEventListener('click', () => {
                this.webrtc.toggleVideo();
            });
        }

        if (endBattleBtn) {
            endBattleBtn.addEventListener('click', () => {
                this.endBattle();
            });
        }
    }

    startBattle() {
        console.log('Starting enhanced battle...');
        
        // Mute all players initially
        this.webrtc.unmuteAll();
        
        // Start first turn after brief countdown
        this.showCountdown(3, () => {
            this.startNextTurn();
        });
    }

    showCountdown(seconds, callback) {
        const countdownOverlay = document.createElement('div');
        countdownOverlay.className = 'countdown-overlay';
        countdownOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            font-family: 'Orbitron', monospace;
            font-size: 8rem;
            font-weight: 900;
            color: #00ffff;
            text-shadow: 0 0 50px #00ffff;
        `;

        document.body.appendChild(countdownOverlay);

        let count = seconds;
        countdownOverlay.textContent = count;

        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownOverlay.textContent = count;
                playNotificationSound();
            } else {
                countdownOverlay.textContent = 'BATTLE!';
                setTimeout(() => {
                    document.body.removeChild(countdownOverlay);
                    callback();
                }, 500);
                clearInterval(countdownInterval);
            }
        }, 1000);
    }

    startNextTurn() {
        if (!AppState.battleState || AppState.battleState.currentTurn >= AppState.battleState.battleOrder.length) {
            this.endBattle();
            return;
        }

        const currentPlayer = AppState.battleState.battleOrder[AppState.battleState.currentTurn];
        AppState.battleState.isActive = true;
        AppState.battleState.timeRemaining = AppState.battleState.turnDuration;

        // Record turn start
        AppState.battleState.turnHistory.push({
            player: currentPlayer,
            startTime: Date.now(),
            round: AppState.battleState.currentRound
        });

        // Update UI
        this.updateBattleDisplay();
        
        // Mute all except current player
        this.webrtc.muteAllExcept(currentPlayer.id);

        // Show turn notification
        showNotification(`${currentPlayer.name}'s turn! 🎤`, 'info');
        playNotificationSound();

        // Start timer
        this.startTurnTimer();

        // Start audio visualization for current player
        this.startAudioVisualization(currentPlayer.id);
    }

    startTurnTimer() {
        this.battleTimer = setInterval(() => {
            if (!AppState.battleState || !AppState.battleState.isActive) {
                clearInterval(this.battleTimer);
                return;
            }

            AppState.battleState.timeRemaining--;
            this.updateTimerDisplay();

            // Warning at 30 seconds
            if (AppState.battleState.timeRemaining === 30) {
                showNotification('30 seconds remaining!', 'warning');
                playNotificationSound();
            }

            // Warning at 10 seconds
            if (AppState.battleState.timeRemaining === 10) {
                showNotification('10 seconds left!', 'warning');
                this.startFinalCountdown();
            }

            // Time's up
            if (AppState.battleState.timeRemaining <= 0) {
                clearInterval(this.battleTimer);
                this.endCurrentTurn();
            }
        }, 1000);
    }

    startFinalCountdown() {
        // Add visual countdown effect
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.style.animation = 'pulse 0.5s ease-in-out infinite';
            timerDisplay.style.color = '#ff4444';
        }
    }

    updateTimerDisplay() {
        const timerDisplay = document.getElementById('timer-display');
        const timerProgress = document.getElementById('timer-progress');

        if (timerDisplay) {
            const minutes = Math.floor(AppState.battleState.timeRemaining / 60);
            const seconds = AppState.battleState.timeRemaining % 60;
            timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        if (timerProgress) {
            const percentage = (AppState.battleState.timeRemaining / AppState.battleState.turnDuration) * 100;
            timerProgress.style.width = `${percentage}%`;
            
            // Change color based on time remaining
            if (percentage < 25) {
                timerProgress.style.background = 'linear-gradient(90deg, #ff4444, #ff0080)';
            } else if (percentage < 50) {
                timerProgress.style.background = 'linear-gradient(90deg, #ffaa00, #ff4444)';
            } else {
                timerProgress.style.background = 'linear-gradient(90deg, #00ffff, #ff0080)';
            }
        }
    }

    updateBattleDisplay() {
        const currentRapperElement = document.getElementById('current-rapper');
        const battleStatus = document.getElementById('battle-status');

        if (AppState.battleState && AppState.battleState.battleOrder.length > 0) {
            const currentPlayer = AppState.battleState.battleOrder[AppState.battleState.currentTurn];
            if (currentRapperElement && currentPlayer) {
                currentRapperElement.textContent = currentPlayer.name;
            }
        }

        // Update battle status
        if (battleStatus) {
            const roundInfo = battleStatus.querySelector('.round-info');
            const nextUp = battleStatus.querySelector('.next-up');
            
            if (roundInfo) {
                const currentTurn = AppState.battleState.currentTurn + 1;
                const totalTurns = AppState.battleState.battleOrder.length;
                roundInfo.textContent = `Turn ${currentTurn} of ${totalTurns}`;
            }
            
            if (nextUp) {
                const nextTurnIndex = AppState.battleState.currentTurn + 1;
                if (nextTurnIndex < AppState.battleState.battleOrder.length) {
                    const nextPlayer = AppState.battleState.battleOrder[nextTurnIndex];
                    nextUp.textContent = `Next: ${nextPlayer.name}`;
                } else {
                    nextUp.textContent = 'Final turn!';
                }
            }
        }
    }

    startAudioVisualization(playerId) {
        if (!this.analyser || this.visualizerActive) return;

        this.visualizerActive = true;
        const videoContainer = document.getElementById(`video-${playerId}`);
        
        if (videoContainer) {
            const canvas = document.createElement('canvas');
            canvas.className = 'audio-visualizer';
            canvas.width = 200;
            canvas.height = 100;
            canvas.style.cssText = `
                position: absolute;
                bottom: 60px;
                left: 10px;
                border-radius: 8px;
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid #00ffff;
            `;
            
            videoContainer.appendChild(canvas);
            
            const ctx = canvas.getContext('2d');
            const bufferLength = this.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            const draw = () => {
                if (!this.visualizerActive) {
                    if (canvas.parentNode) {
                        canvas.parentNode.removeChild(canvas);
                    }
                    return;
                }
                
                requestAnimationFrame(draw);
                
                this.analyser.getByteFrequencyData(dataArray);
                
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                const barWidth = (canvas.width / bufferLength) * 2.5;
                let barHeight;
                let x = 0;
                
                for (let i = 0; i < bufferLength; i++) {
                    barHeight = (dataArray[i] / 255) * canvas.height;
                    
                    const r = barHeight + 25 * (i / bufferLength);
                    const g = 250 * (i / bufferLength);
                    const b = 50;
                    
                    ctx.fillStyle = `rgb(${r},${g},${b})`;
                    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                    
                    x += barWidth + 1;
                }
            };
            
            draw();
        }
    }

    endCurrentTurn() {
        AppState.battleState.isActive = false;
        this.visualizerActive = false;
        
        const currentPlayer = AppState.battleState.battleOrder[AppState.battleState.currentTurn];
        
        // Record turn end
        const turnRecord = AppState.battleState.turnHistory.find(
            turn => turn.player.id === currentPlayer.id && !turn.endTime
        );
        if (turnRecord) {
            turnRecord.endTime = Date.now();
            turnRecord.duration = turnRecord.endTime - turnRecord.startTime;
        }

        // Reset timer display style
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.style.animation = '';
            timerDisplay.style.color = '#00ffff';
        }

        showNotification(`Time's up for ${currentPlayer.name}!`, 'warning');
        playNotificationSound();

        // Move to next turn
        AppState.battleState.currentTurn++;

        // Check if battle is complete
        if (AppState.battleState.currentTurn >= AppState.battleState.battleOrder.length) {
            this.turnTransitionTimer = setTimeout(() => {
                this.endBattle();
            }, 2000);
        } else {
            // Show transition screen
            this.showTurnTransition(() => {
                this.startNextTurn();
            });
        }
    }

    showTurnTransition(callback) {
        const nextPlayer = AppState.battleState.battleOrder[AppState.battleState.currentTurn];
        
        const transitionOverlay = document.createElement('div');
        transitionOverlay.className = 'turn-transition';
        transitionOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 128, 0.1));
            backdrop-filter: blur(10px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 999;
            color: white;
            text-align: center;
        `;

        transitionOverlay.innerHTML = `
            <div style="font-family: 'Orbitron', monospace; font-size: 3rem; font-weight: 900; color: #ff0080; text-shadow: 0 0 30px #ff0080; margin-bottom: 1rem;">
                NEXT UP
            </div>
            <div style="font-size: 4rem; font-weight: 700; color: #00ffff; text-shadow: 0 0 40px #00ffff; margin-bottom: 2rem;">
                ${nextPlayer.name}
            </div>
            <div style="font-size: 1.5rem; opacity: 0.8;">
                Get ready to rap!
            </div>
        `;

        document.body.appendChild(transitionOverlay);

        this.turnTransitionTimer = setTimeout(() => {
            document.body.removeChild(transitionOverlay);
            callback();
        }, 3000);
    }

    endBattle() {
        console.log('Ending battle...');
        
        // Clear any running timers
        if (this.battleTimer) {
            clearInterval(this.battleTimer);
            this.battleTimer = null;
        }
        
        if (this.turnTransitionTimer) {
            clearTimeout(this.turnTransitionTimer);
            this.turnTransitionTimer = null;
        }

        // Stop visualization
        this.visualizerActive = false;

        // Unmute all players
        this.webrtc.unmuteAll();

        AppState.battleState.isActive = false;
        
        showNotification('Battle completed! Time to vote! 🗳️', 'success');
        playNotificationSound();

        setTimeout(() => {
            switchScreen('voting-screen');
            this.initializeVoting();
        }, 1500);
    }

    initializeVoting() {
        // Initialize voting with enhanced features
        setupVotingGrid();
        this.startEnhancedVotingTimer();
        
        // Add voting analytics
        this.setupVotingAnalytics();
    }

    startEnhancedVotingTimer() {
        let timeLeft = 30;
        const countdownElement = document.getElementById('voting-countdown');
        
        const votingInterval = setInterval(() => {
            timeLeft--;
            if (countdownElement) {
                countdownElement.textContent = timeLeft;
                
                // Add urgency effects
                if (timeLeft <= 10) {
                    countdownElement.style.color = '#ff4444';
                    countdownElement.style.animation = 'pulse 0.5s ease-in-out infinite';
                }
            }
            
            if (timeLeft <= 0) {
                clearInterval(votingInterval);
                this.endVoting();
            }
        }, 1000);
    }

    setupVotingAnalytics() {
        // Add real-time vote tracking
        const voteTracker = document.createElement('div');
        voteTracker.id = 'vote-tracker';
        voteTracker.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            border: 1px solid #00ffff;
            border-radius: 8px;
            padding: 1rem;
            color: white;
            font-family: 'Rajdhani', sans-serif;
            z-index: 100;
        `;
        
        document.body.appendChild(voteTracker);
        
        // Update vote tracker periodically
        const updateTracker = () => {
            if (AppState.votes) {
                const totalVotes = Object.values(AppState.votes).reduce((sum, votes) => sum + votes, 0);
                voteTracker.innerHTML = `
                    <div style="font-weight: 600; margin-bottom: 0.5rem;">Live Vote Count</div>
                    <div>Total Votes: ${totalVotes}</div>
                `;
            }
        };
        
        const trackerInterval = setInterval(updateTracker, 1000);
        
        // Clean up tracker after voting
        setTimeout(() => {
            clearInterval(trackerInterval);
            if (voteTracker.parentNode) {
                voteTracker.parentNode.removeChild(voteTracker);
            }
        }, 31000);
    }

    endVoting() {
        // Enhanced voting end with battle statistics
        const battleStats = this.generateBattleStats();
        console.log('Battle Statistics:', battleStats);
        
        // Continue with normal voting end process
        endVoting();
    }

    generateBattleStats() {
        const stats = {
            totalDuration: 0,
            averageTurnDuration: 0,
            playerPerformance: {},
            battleFormat: AppState.battleFormat,
            timestamp: new Date().toISOString()
        };

        if (AppState.battleState && AppState.battleState.turnHistory) {
            AppState.battleState.turnHistory.forEach(turn => {
                if (turn.duration) {
                    stats.totalDuration += turn.duration;
                    
                    if (!stats.playerPerformance[turn.player.id]) {
                        stats.playerPerformance[turn.player.id] = {
                            name: turn.player.name,
                            totalTime: 0,
                            turns: 0
                        };
                    }
                    
                    stats.playerPerformance[turn.player.id].totalTime += turn.duration;
                    stats.playerPerformance[turn.player.id].turns++;
                }
            });
            
            const totalTurns = AppState.battleState.turnHistory.length;
            if (totalTurns > 0) {
                stats.averageTurnDuration = stats.totalDuration / totalTurns;
            }
        }

        return stats;
    }

    cleanup() {
        // Clean up WebRTC and battle resources
        this.webrtc.cleanup();
        
        if (this.battleTimer) {
            clearInterval(this.battleTimer);
            this.battleTimer = null;
        }
        
        if (this.turnTransitionTimer) {
            clearTimeout(this.turnTransitionTimer);
            this.turnTransitionTimer = null;
        }
        
        this.visualizerActive = false;
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

// Global battle system instance
let battleSystem = null;

// Enhanced battle initialization
function initializeBattleScreen() {
    battleSystem = new EnhancedBattleSystem();
    
    battleSystem.initializeBattle().then(success => {
        if (success) {
            console.log('Battle system initialized successfully');
            updateBattleDisplay();
            
            // Start battle after brief delay
            setTimeout(() => {
                battleSystem.startBattle();
            }, 1000);
        } else {
            console.error('Failed to initialize battle system');
            showNotification('Battle initialization failed', 'error');
        }
    });
}

// Override the original battle functions to use enhanced system
function startBattle() {
    if (!canStartBattle()) {
        showNotification('Cannot start battle - not all players are ready', 'error');
        return;
    }
    
    showNotification('Battle starting...', 'success');
    playNotificationSound();
    
    setTimeout(() => {
        switchScreen('battle-screen');
        initializeBattleScreen();
    }, 1000);
}

function endBattle() {
    if (battleSystem) {
        battleSystem.endBattle();
    }
}

function toggleMute() {
    if (battleSystem && battleSystem.webrtc) {
        battleSystem.webrtc.toggleAudio();
    } else {
        showNotification('Microphone toggled', 'info');
    }
}

function toggleVideo() {
    if (battleSystem && battleSystem.webrtc) {
        battleSystem.webrtc.toggleVideo();
    } else {
        showNotification('Camera toggled', 'info');
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (battleSystem) {
        battleSystem.cleanup();
    }
});

