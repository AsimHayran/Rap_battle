// Global App State
const AppState = {
    currentScreen: 'intro-screen',
    currentUser: null,
    currentRoom: null,
    players: [],
    battleState: null,
    isHost: false,
    roomCode: null,
    battleFormat: '1v1',
    roomType: 'public'
};

// Utility Functions
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generatePlayerId() {
    return 'player_' + Math.random().toString(36).substring(2, 9);
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

function playNotificationSound() {
    const audio = document.getElementById('notification-sound');
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }
}

function switchScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        AppState.currentScreen = screenId;
    }
}

function updateOnlineStats() {
    // Simulate dynamic online stats
    const onlineCount = document.getElementById('online-count');
    const battleCount = document.getElementById('battle-count');
    
    if (onlineCount) {
        const count = Math.floor(Math.random() * 100) + 200;
        onlineCount.textContent = count;
    }
    
    if (battleCount) {
        const battles = Math.floor(Math.random() * 20) + 5;
        battleCount.textContent = battles;
    }
}

// Screen Management Functions
function initializeIntroScreen() {
    const introScreen = document.getElementById('intro-screen');
    
    // Handle Enter key or click to continue
    function continueToMenu() {
        setTimeout(() => {
            switchScreen('main-menu');
            updateOnlineStats();
        }, 500);
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && AppState.currentScreen === 'intro-screen') {
            continueToMenu();
        }
    });
    
    introScreen.addEventListener('click', continueToMenu);
    
    // Auto-continue after 5 seconds
    setTimeout(continueToMenu, 5000);
}

function initializeMainMenu() {
    const createRoomBtn = document.getElementById('create-room-btn');
    const joinRandomBtn = document.getElementById('join-random-btn');
    const joinPrivateBtn = document.getElementById('join-private-btn');
    
    createRoomBtn.addEventListener('click', () => {
        switchScreen('room-creation');
    });
    
    joinRandomBtn.addEventListener('click', () => {
        handleRandomMatchmaking();
    });
    
    joinPrivateBtn.addEventListener('click', () => {
        switchScreen('join-private');
    });
    
    // Update stats periodically
    setInterval(updateOnlineStats, 5000);
}

function initializeRoomCreation() {
    const createRoomConfirm = document.getElementById('create-room-confirm');
    const backToMenu = document.getElementById('back-to-menu');
    const roomNameInput = document.getElementById('room-name');
    const playerNameInput = document.getElementById('player-name');
    
    createRoomConfirm.addEventListener('click', () => {
        const roomName = roomNameInput.value.trim();
        const playerName = playerNameInput.value.trim();
        const battleFormat = document.querySelector('input[name="battle-format"]:checked').value;
        const roomType = document.querySelector('input[name="room-type"]:checked').value;
        
        if (!roomName || !playerName) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        createRoom(roomName, playerName, battleFormat, roomType);
    });
    
    backToMenu.addEventListener('click', () => {
        switchScreen('main-menu');
    });
}

function initializeJoinPrivate() {
    const joinPrivateConfirm = document.getElementById('join-private-confirm');
    const backToMenu2 = document.getElementById('back-to-menu-2');
    const invitationCodeInput = document.getElementById('invitation-code');
    const playerNameJoinInput = document.getElementById('player-name-join');
    
    joinPrivateConfirm.addEventListener('click', () => {
        const invitationCode = invitationCodeInput.value.trim().toUpperCase();
        const playerName = playerNameJoinInput.value.trim();
        
        if (!invitationCode || !playerName) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (invitationCode.length !== 6) {
            showNotification('Invitation code must be 6 characters', 'error');
            return;
        }
        
        joinPrivateRoom(invitationCode, playerName);
    });
    
    backToMenu2.addEventListener('click', () => {
        switchScreen('main-menu');
    });
}

function initializeWaitingRoom() {
    const startBattleBtn = document.getElementById('start-battle-btn');
    const addTestPlayerBtn = document.getElementById('add-test-player-btn');
    const leaveRoomBtn = document.getElementById('leave-room-btn');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat');
    
    startBattleBtn.addEventListener('click', () => {
        if (AppState.isHost && canStartBattle()) {
            startBattle();
        }
    });
    
    addTestPlayerBtn.addEventListener('click', () => {
        addTestPlayer();
    });
    
    leaveRoomBtn.addEventListener('click', () => {
        leaveRoom();
    });
    
    // Chat functionality
    function sendChatMessage() {
        const message = chatInput.value.trim();
        if (message && AppState.currentUser) {
            addChatMessage(AppState.currentUser.name, message);
            chatInput.value = '';
        }
    }
    
    sendChatBtn.addEventListener('click', sendChatMessage);
    
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
}

// Room Management Functions
function createRoom(roomName, playerName, battleFormat, roomType) {
    const roomCode = generateRoomCode();
    const playerId = generatePlayerId();
    
    AppState.currentUser = {
        id: playerId,
        name: playerName,
        isReady: true
    };
    
    AppState.currentRoom = {
        name: roomName,
        code: roomCode,
        format: battleFormat,
        type: roomType,
        host: playerId,
        maxPlayers: battleFormat === '1v1' ? 2 : 4
    };
    
    AppState.players = [AppState.currentUser];
    AppState.isHost = true;
    AppState.roomCode = roomCode;
    AppState.battleFormat = battleFormat;
    AppState.roomType = roomType;
    
    // Store room in localStorage for private room functionality
    if (roomType === 'private') {
        const roomData = {
            name: roomName,
            code: roomCode,
            format: battleFormat,
            type: roomType,
            host: playerId,
            hostName: playerName,
            maxPlayers: battleFormat === '1v1' ? 2 : 4,
            players: [AppState.currentUser],
            created: Date.now()
        };
        localStorage.setItem(`room_${roomCode}`, JSON.stringify(roomData));
        showNotification(`Private room created! Share code: ${roomCode}`, 'success');
    } else {
        showNotification(`Public room created!`, 'success');
    }
    
    playNotificationSound();
    
    switchScreen('waiting-room');
    updateWaitingRoom();
    
    // No automatic bot joining - wait for real players
}

function joinPrivateRoom(invitationCode, playerName) {
    // Check if room exists in localStorage
    const roomData = localStorage.getItem(`room_${invitationCode}`);
    
    if (!roomData) {
        showNotification('Invalid invitation code or room not found!', 'error');
        return;
    }
    
    const room = JSON.parse(roomData);
    
    // Check if room is full
    if (room.players.length >= room.maxPlayers) {
        showNotification('Room is full!', 'error');
        return;
    }
    
    // Check if room is too old (older than 24 hours)
    if (Date.now() - room.created > 24 * 60 * 60 * 1000) {
        showNotification('Room has expired!', 'error');
        localStorage.removeItem(`room_${invitationCode}`);
        return;
    }
    
    const playerId = generatePlayerId();
    
    AppState.currentUser = {
        id: playerId,
        name: playerName,
        isReady: false
    };
    
    // Join the existing room
    AppState.currentRoom = {
        name: room.name,
        code: invitationCode,
        format: room.format,
        type: 'private',
        host: room.host,
        maxPlayers: room.maxPlayers
    };
    
    // Add current user to existing players
    room.players.push(AppState.currentUser);
    AppState.players = room.players;
    
    AppState.isHost = false;
    AppState.roomCode = invitationCode;
    AppState.battleFormat = room.format;
    AppState.roomType = 'private';
    
    // Update room data in localStorage
    localStorage.setItem(`room_${invitationCode}`, JSON.stringify(room));
    
    showNotification('Successfully joined private room!', 'success');
    playNotificationSound();
    
    switchScreen('waiting-room');
    updateWaitingRoom();
}

function handleRandomMatchmaking() {
    showNotification('Searching for opponents...', 'info');
    
    // Simulate matchmaking delay
    setTimeout(() => {
        const battleFormat = Math.random() > 0.5 ? '1v1' : '2v2';
        const playerName = 'Player' + Math.floor(Math.random() * 1000);
        const playerId = generatePlayerId();
        
        AppState.currentUser = {
            id: playerId,
            name: playerName,
            isReady: true
        };
        
        AppState.currentRoom = {
            name: 'Random Battle #' + Math.floor(Math.random() * 1000),
            code: null, // No code for random matchmaking
            format: battleFormat,
            type: 'public',
            host: playerId,
            maxPlayers: battleFormat === '1v1' ? 2 : 4
        };
        
        AppState.players = [AppState.currentUser];
        AppState.isHost = true;
        AppState.roomCode = null;
        AppState.battleFormat = battleFormat;
        AppState.roomType = 'public';
        
        showNotification('Match found! Waiting for opponents...', 'success');
        playNotificationSound();
        
        switchScreen('waiting-room');
        updateWaitingRoom();
        
        // No automatic bot joining - this is just a demo
        showNotification('In a real app, this would connect you with other players online', 'info');
    }, 2000);
}

function simulatePlayersJoining() {
    const maxPlayers = AppState.currentRoom.maxPlayers;
    const currentPlayerCount = AppState.players.length;
    
    if (currentPlayerCount >= maxPlayers) return;
    
    const playerNames = [
        'MC_Thunder', 'RapGod_X', 'BeatDropper', 'FlowMaster', 'RhymeTime',
        'VerseKing', 'BassHunter', 'LyricLord', 'RapNinja', 'FlowState',
        'BeatBoxer', 'RhymeScheme', 'VerseViper', 'FlowPhenom', 'RapRebel'
    ];
    
    function addRandomPlayer() {
        if (AppState.players.length >= maxPlayers) return;
        
        const randomName = playerNames[Math.floor(Math.random() * playerNames.length)];
        const newPlayer = {
            id: generatePlayerId(),
            name: randomName,
            isReady: Math.random() > 0.3 // 70% chance to be ready
        };
        
        AppState.players.push(newPlayer);
        updateWaitingRoom();
        showNotification(`${randomName} joined the battle!`, 'info');
        
        // Simulate player getting ready
        if (!newPlayer.isReady) {
            setTimeout(() => {
                newPlayer.isReady = true;
                updateWaitingRoom();
                showNotification(`${randomName} is ready!`, 'success');
            }, Math.random() * 3000 + 1000);
        }
    }
    
    // Add players with random delays
    const playersToAdd = maxPlayers - currentPlayerCount;
    for (let i = 0; i < playersToAdd; i++) {
        setTimeout(addRandomPlayer, (i + 1) * (Math.random() * 2000 + 1000));
    }
}

function updateWaitingRoom() {
    // Update room info
    const roomNameDisplay = document.getElementById('current-room-name');
    const roomCodeDisplay = document.getElementById('room-code-display');
    const battleFormatDisplay = document.getElementById('battle-format-display');
    
    if (roomNameDisplay) roomNameDisplay.textContent = AppState.currentRoom.name;
    if (roomCodeDisplay) {
        if (AppState.roomType === 'private' && AppState.roomCode) {
            roomCodeDisplay.textContent = `Code: ${AppState.roomCode}`;
        } else {
            roomCodeDisplay.textContent = 'Public Room';
        }
    }
    if (battleFormatDisplay) {
        battleFormatDisplay.textContent = `${AppState.battleFormat.toUpperCase()} Battle`;
    }
    
    // Update players grid
    const playersGrid = document.getElementById('players-grid');
    if (playersGrid) {
        playersGrid.innerHTML = '';
        
        const maxPlayers = AppState.currentRoom.maxPlayers;
        
        // Add existing players
        AppState.players.forEach(player => {
            const playerCard = createPlayerCard(player);
            playersGrid.appendChild(playerCard);
        });
        
        // Add empty slots
        for (let i = AppState.players.length; i < maxPlayers; i++) {
            const emptyCard = createEmptyPlayerCard();
            playersGrid.appendChild(emptyCard);
        }
    }
    
    // Update start battle button
    const startBattleBtn = document.getElementById('start-battle-btn');
    if (startBattleBtn) {
        const canStart = canStartBattle();
        startBattleBtn.disabled = !canStart || !AppState.isHost;
        
        if (!AppState.isHost) {
            startBattleBtn.textContent = 'WAITING FOR HOST';
        } else if (canStart) {
            startBattleBtn.textContent = 'START BATTLE';
        } else {
            startBattleBtn.textContent = `WAITING FOR PLAYERS (${AppState.players.length}/${maxPlayers})`;
        }
    }
}

function createPlayerCard(player) {
    const card = document.createElement('div');
    card.className = `player-card ${player.isReady ? 'ready' : ''}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'player-avatar';
    avatar.textContent = player.name.charAt(0).toUpperCase();
    
    const name = document.createElement('div');
    name.className = 'player-name';
    name.textContent = player.name;
    
    const status = document.createElement('div');
    status.className = 'player-status';
    status.textContent = player.isReady ? 'Ready' : 'Getting Ready...';
    
    card.appendChild(avatar);
    card.appendChild(name);
    card.appendChild(status);
    
    return card;
}

function createEmptyPlayerCard() {
    const card = document.createElement('div');
    card.className = 'player-card empty';
    card.textContent = 'Waiting for player...';
    return card;
}

function canStartBattle() {
    const requiredPlayers = AppState.currentRoom.maxPlayers;
    const readyPlayers = AppState.players.filter(p => p.isReady).length;
    return AppState.players.length === requiredPlayers && readyPlayers === requiredPlayers;
}

function addChatMessage(sender, message) {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        
        const senderSpan = document.createElement('span');
        senderSpan.className = 'chat-sender';
        senderSpan.textContent = sender + ':';
        
        const messageText = document.createTextNode(' ' + message);
        
        messageDiv.appendChild(senderSpan);
        messageDiv.appendChild(messageText);
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function leaveRoom() {
    // Clean up room data if host is leaving
    if (AppState.isHost && AppState.roomType === 'private' && AppState.roomCode) {
        localStorage.removeItem(`room_${AppState.roomCode}`);
    }
    
    AppState.currentRoom = null;
    AppState.players = [];
    AppState.isHost = false;
    AppState.roomCode = null;
    AppState.currentUser = null;
    
    showNotification('Left the room', 'info');
    switchScreen('main-menu');
}

// Add a test player for demo purposes
function addTestPlayer() {
    if (!AppState.currentRoom || AppState.players.length >= AppState.currentRoom.maxPlayers) {
        showNotification('Cannot add more players - room is full!', 'error');
        return;
    }
    
    const testPlayerNames = [
        'MC_Thunder', 'RapGod_X', 'BeatDropper', 'FlowMaster', 'RhymeTime',
        'VerseKing', 'BassHunter', 'LyricLord', 'RapNinja', 'FlowState'
    ];
    
    const randomName = testPlayerNames[Math.floor(Math.random() * testPlayerNames.length)];
    const testPlayer = {
        id: generatePlayerId(),
        name: randomName,
        isReady: Math.random() > 0.3 // 70% chance to be ready
    };
    
    AppState.players.push(testPlayer);
    
    // Update localStorage for private rooms
    if (AppState.roomType === 'private' && AppState.roomCode) {
        const roomData = JSON.parse(localStorage.getItem(`room_${AppState.roomCode}`));
        if (roomData) {
            roomData.players = AppState.players;
            localStorage.setItem(`room_${AppState.roomCode}`, JSON.stringify(roomData));
        }
    }
    
    updateWaitingRoom();
    showNotification(`${randomName} joined the battle!`, 'info');
    
    // Simulate player getting ready
    if (!testPlayer.isReady) {
        setTimeout(() => {
            testPlayer.isReady = true;
            updateWaitingRoom();
            showNotification(`${randomName} is ready!`, 'success');
        }, Math.random() * 3000 + 1000);
    }
}

function startBattle() {
    if (!canStartBattle()) {
        showNotification('Cannot start battle - not all players are ready', 'error');
        return;
    }
    
    showNotification('Battle starting...', 'success');
    playNotificationSound();
    
    // Initialize battle state
    AppState.battleState = {
        currentRound: 1,
        totalRounds: AppState.battleFormat === '1v1' ? 2 : 4,
        currentTurn: 0,
        turnDuration: 120, // 2 minutes in seconds
        timeRemaining: 120,
        isActive: false,
        votes: {},
        battleOrder: [...AppState.players]
    };
    
    setTimeout(() => {
        switchScreen('battle-screen');
        initializeBattleScreen();
    }, 1000);
}

// Battle Management Functions
function initializeBattleScreen() {
    updateBattleDisplay();
    setupBattleControls();
    
    // Start first turn after a brief delay
    setTimeout(() => {
        startNextTurn();
    }, 2000);
}

function updateBattleDisplay() {
    // Update battle info
    const currentRapperElement = document.getElementById('current-rapper');
    const timerDisplay = document.getElementById('timer-display');
    const battleStatus = document.getElementById('battle-status');
    
    if (AppState.battleState && AppState.battleState.battleOrder.length > 0) {
        const currentPlayer = AppState.battleState.battleOrder[AppState.battleState.currentTurn];
        if (currentRapperElement && currentPlayer) {
            currentRapperElement.textContent = currentPlayer.name;
        }
    }
    
    if (timerDisplay) {
        const minutes = Math.floor(AppState.battleState.timeRemaining / 60);
        const seconds = AppState.battleState.timeRemaining % 60;
        timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Update video grid
    updateVideoGrid();
}

function updateVideoGrid() {
    const videoGrid = document.getElementById('video-grid');
    if (videoGrid) {
        videoGrid.innerHTML = '';
        
        AppState.players.forEach((player, index) => {
            const videoContainer = createVideoContainer(player, index);
            videoGrid.appendChild(videoContainer);
        });
    }
}

function createVideoContainer(player, index) {
    const container = document.createElement('div');
    container.className = 'video-container';
    container.id = `video-${player.id}`;
    
    // Add active class if it's this player's turn
    if (AppState.battleState && 
        AppState.battleState.battleOrder[AppState.battleState.currentTurn]?.id === player.id &&
        AppState.battleState.isActive) {
        container.classList.add('active');
    }
    
    // Create video element (placeholder for now)
    const video = document.createElement('div');
    video.className = 'video-element';
    video.style.background = `linear-gradient(135deg, 
        hsl(${index * 60}, 70%, 50%), 
        hsl(${(index * 60 + 60) % 360}, 70%, 30%))`;
    video.style.display = 'flex';
    video.style.alignItems = 'center';
    video.style.justifyContent = 'center';
    video.style.fontSize = '3rem';
    video.style.fontWeight = 'bold';
    video.textContent = player.name.charAt(0).toUpperCase();
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'video-overlay';
    
    const name = document.createElement('div');
    name.className = 'video-name';
    name.textContent = player.name;
    
    const status = document.createElement('div');
    status.className = 'video-status';
    
    if (AppState.battleState && 
        AppState.battleState.battleOrder[AppState.battleState.currentTurn]?.id === player.id &&
        AppState.battleState.isActive) {
        status.textContent = '🎤 RAPPING NOW';
        container.classList.add('active');
    } else {
        status.textContent = '🔇 MUTED';
        container.classList.add('muted');
    }
    
    overlay.appendChild(name);
    overlay.appendChild(status);
    
    container.appendChild(video);
    container.appendChild(overlay);
    
    return container;
}

function setupBattleControls() {
    const muteBtn = document.getElementById('mute-btn');
    const videoBtn = document.getElementById('video-btn');
    const endBattleBtn = document.getElementById('end-battle-btn');
    
    if (muteBtn) {
        muteBtn.addEventListener('click', toggleMute);
    }
    
    if (videoBtn) {
        videoBtn.addEventListener('click', toggleVideo);
    }
    
    if (endBattleBtn) {
        endBattleBtn.addEventListener('click', endBattle);
    }
}

function startNextTurn() {
    if (!AppState.battleState) return;
    
    const currentPlayer = AppState.battleState.battleOrder[AppState.battleState.currentTurn];
    AppState.battleState.isActive = true;
    AppState.battleState.timeRemaining = AppState.battleState.turnDuration;
    
    showNotification(`${currentPlayer.name}'s turn to rap!`, 'info');
    playNotificationSound();
    
    updateBattleDisplay();
    startTimer();
}

function startTimer() {
    const timerInterval = setInterval(() => {
        if (!AppState.battleState || !AppState.battleState.isActive) {
            clearInterval(timerInterval);
            return;
        }
        
        AppState.battleState.timeRemaining--;
        
        // Update timer display
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
        }
        
        // Time's up
        if (AppState.battleState.timeRemaining <= 0) {
            clearInterval(timerInterval);
            endCurrentTurn();
        }
    }, 1000);
}

function endCurrentTurn() {
    if (!AppState.battleState) return;
    
    AppState.battleState.isActive = false;
    const currentPlayer = AppState.battleState.battleOrder[AppState.battleState.currentTurn];
    
    showNotification(`Time's up for ${currentPlayer.name}!`, 'warning');
    
    // Move to next turn
    AppState.battleState.currentTurn++;
    
    // Check if battle is complete
    if (AppState.battleState.currentTurn >= AppState.battleState.battleOrder.length) {
        // All players have had their turn
        setTimeout(() => {
            endBattle();
        }, 2000);
    } else {
        // Start next player's turn
        setTimeout(() => {
            startNextTurn();
        }, 3000);
    }
    
    updateBattleDisplay();
}

function toggleMute() {
    showNotification('Microphone toggled', 'info');
}

function toggleVideo() {
    showNotification('Camera toggled', 'info');
}

function endBattle() {
    AppState.battleState.isActive = false;
    showNotification('Battle ended! Time to vote!', 'success');
    playNotificationSound();
    
    setTimeout(() => {
        switchScreen('voting-screen');
        initializeVotingScreen();
    }, 1000);
}

// Voting System Functions
function initializeVotingScreen() {
    setupVotingGrid();
    startVotingTimer();
}

function setupVotingGrid() {
    const votingGrid = document.getElementById('voting-grid');
    if (votingGrid) {
        votingGrid.innerHTML = '';
        
        AppState.players.forEach(player => {
            const voteOption = createVoteOption(player);
            votingGrid.appendChild(voteOption);
        });
    }
}

function createVoteOption(player) {
    const option = document.createElement('div');
    option.className = 'vote-option';
    option.dataset.playerId = player.id;
    
    const avatar = document.createElement('div');
    avatar.className = 'vote-avatar';
    avatar.textContent = player.name.charAt(0).toUpperCase();
    
    const name = document.createElement('div');
    name.className = 'vote-name';
    name.textContent = player.name;
    
    const percentage = document.createElement('div');
    percentage.className = 'vote-percentage';
    percentage.textContent = '0%';
    
    option.appendChild(avatar);
    option.appendChild(name);
    option.appendChild(percentage);
    
    option.addEventListener('click', () => {
        castVote(player.id);
    });
    
    return option;
}

function castVote(playerId) {
    // Remove previous vote
    document.querySelectorAll('.vote-option').forEach(option => {
        option.classList.remove('voted');
    });
    
    // Add vote to selected player
    const selectedOption = document.querySelector(`[data-player-id="${playerId}"]`);
    if (selectedOption) {
        selectedOption.classList.add('voted');
    }
    
    AppState.userVote = playerId;
    showNotification('Vote cast successfully!', 'success');
    
    // Simulate other votes
    simulateVoting();
}

function simulateVoting() {
    if (!AppState.votes) {
        AppState.votes = {};
        AppState.players.forEach(player => {
            AppState.votes[player.id] = Math.floor(Math.random() * 5) + 1;
        });
        
        // Add user vote
        if (AppState.userVote) {
            AppState.votes[AppState.userVote] += 1;
        }
    }
    
    updateVoteDisplay();
}

function updateVoteDisplay() {
    const totalVotes = Object.values(AppState.votes).reduce((sum, votes) => sum + votes, 0);
    
    document.getElementById('total-votes').textContent = totalVotes;
    
    AppState.players.forEach(player => {
        const votes = AppState.votes[player.id] || 0;
        const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
        
        const option = document.querySelector(`[data-player-id="${player.id}"]`);
        if (option) {
            const percentageElement = option.querySelector('.vote-percentage');
            if (percentageElement) {
                percentageElement.textContent = `${percentage}% (${votes} votes)`;
            }
        }
    });
}

function startVotingTimer() {
    let timeLeft = 30;
    const countdownElement = document.getElementById('voting-countdown');
    
    const votingInterval = setInterval(() => {
        timeLeft--;
        if (countdownElement) {
            countdownElement.textContent = timeLeft;
        }
        
        if (timeLeft <= 0) {
            clearInterval(votingInterval);
            endVoting();
        }
    }, 1000);
}

function endVoting() {
    // Determine winner
    let maxVotes = 0;
    let winners = [];
    
    AppState.players.forEach(player => {
        const votes = AppState.votes[player.id] || 0;
        if (votes > maxVotes) {
            maxVotes = votes;
            winners = [player];
        } else if (votes === maxVotes) {
            winners.push(player);
        }
    });
    
    // Handle tie
    if (winners.length > 1) {
        showNotification('It\'s a tie! Rematch required!', 'warning');
        setTimeout(() => {
            // Reset for rematch
            AppState.battleState = null;
            AppState.votes = {};
            AppState.userVote = null;
            switchScreen('waiting-room');
            updateWaitingRoom();
        }, 3000);
        return;
    }
    
    const winner = winners[0];
    const winnerVotes = AppState.votes[winner.id];
    const totalVotes = Object.values(AppState.votes).reduce((sum, votes) => sum + votes, 0);
    const winnerPercentage = Math.round((winnerVotes / totalVotes) * 100);
    
    showNotification(`${winner.name} wins the battle!`, 'success');
    playNotificationSound();
    
    setTimeout(() => {
        switchScreen('results-screen');
        displayResults(winner, winnerVotes, winnerPercentage);
    }, 1000);
}

function displayResults(winner, votes, percentage) {
    const winnerNameElement = document.getElementById('winner-name');
    const winnerVotesElement = document.getElementById('winner-votes');
    const finalResultsElement = document.getElementById('final-results');
    
    if (winnerNameElement) {
        winnerNameElement.textContent = winner.name;
    }
    
    if (winnerVotesElement) {
        winnerVotesElement.textContent = `${votes} votes (${percentage}%)`;
    }
    
    if (finalResultsElement) {
        finalResultsElement.innerHTML = '';
        
        // Sort players by votes
        const sortedPlayers = [...AppState.players].sort((a, b) => {
            return (AppState.votes[b.id] || 0) - (AppState.votes[a.id] || 0);
        });
        
        sortedPlayers.forEach(player => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            const name = document.createElement('div');
            name.className = 'result-name';
            name.textContent = player.name;
            
            const votes = document.createElement('div');
            votes.className = 'result-votes';
            votes.textContent = `${AppState.votes[player.id] || 0} votes`;
            
            resultItem.appendChild(name);
            resultItem.appendChild(votes);
            finalResultsElement.appendChild(resultItem);
        });
    }
    
    setupResultsActions();
}

function setupResultsActions() {
    const rematchBtn = document.getElementById('rematch-btn');
    const newBattleBtn = document.getElementById('new-battle-btn');
    const mainMenuBtn = document.getElementById('main-menu-btn');
    
    if (rematchBtn) {
        rematchBtn.addEventListener('click', () => {
            // Reset battle state for rematch
            AppState.battleState = null;
            AppState.votes = {};
            AppState.userVote = null;
            
            showNotification('Starting rematch...', 'info');
            switchScreen('waiting-room');
            updateWaitingRoom();
            
            // Auto-start battle after brief delay
            setTimeout(() => {
                if (canStartBattle()) {
                    startBattle();
                }
            }, 2000);
        });
    }
    
    if (newBattleBtn) {
        newBattleBtn.addEventListener('click', () => {
            // Reset everything for new battle
            AppState.currentRoom = null;
            AppState.players = [];
            AppState.isHost = false;
            AppState.roomCode = null;
            AppState.currentUser = null;
            AppState.battleState = null;
            AppState.votes = {};
            AppState.userVote = null;
            
            showNotification('Starting new battle search...', 'info');
            handleRandomMatchmaking();
        });
    }
    
    if (mainMenuBtn) {
        mainMenuBtn.addEventListener('click', () => {
            // Reset everything and go to main menu
            AppState.currentRoom = null;
            AppState.players = [];
            AppState.isHost = false;
            AppState.roomCode = null;
            AppState.currentUser = null;
            AppState.battleState = null;
            AppState.votes = {};
            AppState.userVote = null;
            
            switchScreen('main-menu');
            updateOnlineStats();
        });
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all screens
    initializeIntroScreen();
    initializeMainMenu();
    initializeRoomCreation();
    initializeJoinPrivate();
    initializeWaitingRoom();
    
    // Start with intro screen
    switchScreen('intro-screen');
    
    console.log('ShadowRoot17 Rap Battle App initialized!');
});

