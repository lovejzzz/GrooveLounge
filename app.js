// Game data and state
const gameState = {
    coins: 2000,
    currentBox: null, // Track which box is currently being opened
    currentCard: null,
    developerMode: false, // Track if developer mode is active
    collection: {
        character: {},
        weapon: {},
        instrument: {}
    },
    completedSets: [],
    // Track cards the player has seen before (not just owned)
    seenCards: []
};

// Box types and their costs
const boxTypes = {
    conqueror: {
        name: 'Conqueror Box',
        cost: 100,
        rarities: {
            classic: 0.55,  // 55.0%
            silver: 0.20,   // 20.0%
            gold: 0.10,     // 10.0%
            rare: 0.06,     // 6.0%
            supreme: 0.035,  // 3.5%
            epic: 0.025,    // 2.5%
            legendary: 0.018, // 1.8%
            mythic: 0.009,   // 0.9%
            secret: 0.003    // 0.3%
        }
    },
    maestro: {
        name: 'Maestro Box',
        cost: 200,
        rarities: {
            silver: 0.35,    // 35.0%
            gold: 0.25,      // 25.0%
            rare: 0.20,      // 20.0%
            supreme: 0.10,    // 10.0%
            epic: 0.06,       // 6.0%
            legendary: 0.025,  // 2.5%
            mythic: 0.01,     // 1.0%
            secret: 0.005     // 0.5%
        }
    },
    visionary: {
        name: 'Visionary Box',
        cost: 500,
        rarities: {
            supreme: 0.45,    // 45.0%
            epic: 0.25,       // 25.0%
            legendary: 0.15,  // 15.0%
            mythic: 0.10,     // 10.0%
            secret: 0.05      // 5.0%
        }
    }
};

// Card data
const cardTypes = {
    character: ['bird', 'boat', 'cat', 'elephant', 'monk', 'rat', 'robot'],
    weapon: ['crossbow', 'dagger', 'pistol', 'polearm', 'spear', 'sword'],
    instrument: ['bass', 'clarinet', 'flute', 'harmonica', 'keys', 'saxophone', 'trombone', 'trumpet', 'ukulele', 'violin']
};

const rarities = ['classic', 'silver', 'gold', 'rare', 'supreme', 'epic', 'legendary', 'mythic', 'secret'];

const rarityValues = {
    classic: 10,
    silver: 20,
    gold: 40,
    rare: 80,
    supreme: 150,
    epic: 225,
    legendary: 350,
    mythic: 600,
    secret: 'random' // Will be randomized between 700-1500 when selling
};

// DOM Elements
const elements = {
    coins: document.getElementById('coins'),
    // We now have multiple boxes, so these are handled differently
    conquerorBox: document.getElementById('conquerorBox'),
    maestroBox: document.getElementById('maestroBox'),
    visionaryBox: document.getElementById('visionaryBox'),
    cardModal: document.getElementById('cardModal'),
    cardReveal: document.getElementById('cardReveal'),
    revealedCard: document.getElementById('revealedCard'),
    cardInfo: document.getElementById('cardInfo'),
    claimCardBtn: document.getElementById('claimCardBtn'),
    characterSets: document.getElementById('characterSets'),
    weaponSets: document.getElementById('weaponSets'),
    instrumentSets: document.getElementById('instrumentSets'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    completionModal: document.getElementById('completionModal'),
    completionMessage: document.getElementById('completionMessage'),
    rewardAmount: document.getElementById('rewardAmount'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    totalCards: document.getElementById('totalCards'),
    completedSetsCount: document.getElementById('completedSetsCount'),
    rarestCard: document.getElementById('rarestCard')
};

// Initialize the game
function initGame() {
    // Load saved game data if available
    loadGame();
    
    // Update UI with game state
    updateCoinsDisplay();
    renderCollection();
    updateCollectionStats();
    
    // Set up tab buttons properly
    console.log('Setting up tab buttons');
    document.querySelectorAll('.tab-btn').forEach(btn => {
        // First remove any existing click listeners by cloning
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // Add click event listener
        newBtn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            console.log('Tab clicked:', tabName);
            
            // Remove active class from all buttons and tab contents
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to current button and tab content
            this.classList.add('active');
            const tabContent = document.getElementById(`${tabName}Tab`);
            if (tabContent) {
                tabContent.classList.add('active');
                console.log('Tab activated:', tabName);
            } else {
                console.error('Tab content not found:', tabName);
            }
        });
    });
    
    // Event listeners - skip openBoxBtn and claimCardBtn as they're handled separately
    elements.lootBox.addEventListener('click', openBox);
    
    // Make sure these elements exist before adding listeners
    if (elements.closeModalBtn) {
        elements.closeModalBtn.addEventListener('click', closeModal);
    }
    
    // Add a direct event listener to the closeModalBtn by ID to ensure it works
    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn) {
        console.log('Adding direct event listener to closeModalBtn');
        closeBtn.addEventListener('click', function() {
            console.log('Close modal button clicked directly');
            const modal = document.getElementById('completionModal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Add hover effect sound for buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            playSound('hover');
        });
        button.addEventListener('click', () => {
            playSound('click');
        });
    });
    
    // Add keyboard support for spacebar to trigger the Claim button and prevent scrolling
    document.addEventListener('keydown', function(event) {
        // Always prevent spacebar from scrolling the page
        if (event.code === 'Space' || event.keyCode === 32) {
            // Prevent default spacebar action (scrolling)
            event.preventDefault();
            
            // Check if the card reveal modal is visible
            if (elements.cardModal && elements.cardModal.style.display === 'flex') {
                // Find and click the claim button if it exists
                const claimBtn = document.getElementById('claimCardBtn');
                if (claimBtn) {
                    console.log('Spacebar pressed - triggering claim button');
                    claimBtn.click();
                }
            }
        }
    });
    
    // We'll handle tab navigation in the initGame function instead
    
    // Add welcome animation
    setTimeout(() => {
        elements.lootBox.classList.add('pulse-animation');
        setTimeout(() => {
            elements.lootBox.classList.remove('pulse-animation');
        }, 1000);
    }, 500);
}

// Save game state to local storage
function saveGame() {
    localStorage.setItem('lootBoxGame', JSON.stringify({
        coins: gameState.coins,
        collection: gameState.collection,
        completedSets: gameState.completedSets,
        seenCards: gameState.seenCards
    }));
}

// Load game state from local storage
function loadGame() {
    const savedGame = localStorage.getItem('lootBoxGame');
    
    if (savedGame) {
        const parsedGame = JSON.parse(savedGame);
        gameState.coins = parsedGame.coins;
        gameState.collection = parsedGame.collection;
        gameState.completedSets = parsedGame.completedSets || [];
        gameState.seenCards = parsedGame.seenCards || [];
    }
}

// Update coins display with animation and rolling numbers
function updateCoinsDisplay() {
    // Store previous coin amount to check if there was a change
    const previousCoins = parseInt(elements.coins.textContent);
    const newCoins = gameState.coins;
    const coinDifference = newCoins - previousCoins;
    
    // Only animate if coins have changed and it's not the initial load
    if (coinDifference !== 0 && !isNaN(previousCoins)) {
        // Create floating indicator for coin change
        const floatingIndicator = document.createElement('div');
        floatingIndicator.className = 'floating-coin-indicator';
        floatingIndicator.textContent = coinDifference > 0 ? `+${coinDifference}` : coinDifference;
        floatingIndicator.style.color = coinDifference > 0 ? '#2ecc71' : '#e74c3c';
        
        // Make sure the currency display has position: relative for proper indicator positioning
        const currencyDisplay = elements.coins.parentElement;
        if (getComputedStyle(currencyDisplay).position === 'static') {
            currencyDisplay.style.position = 'relative';
        }
        
        // Add the indicator to the currency display
        currencyDisplay.appendChild(floatingIndicator);
        
        // Remove the indicator after animation completes
        setTimeout(() => {
            floatingIndicator.remove();
        }, 1500);
        
        // Add animation classes
        elements.coins.classList.add('animate');
        elements.coins.parentElement.classList.add('animate');
        
        // Animate the number rolling effect
        animateNumberChange(previousCoins, newCoins, elements.coins);
        
        // Remove animation classes after animation completes
        setTimeout(() => {
            elements.coins.classList.remove('animate');
            elements.coins.parentElement.classList.remove('animate');
        }, 600); // Match the animation duration
    } else {
        // If no animation, just update the text
        elements.coins.textContent = newCoins;
    }
}

// Animate number change with rolling effect
function animateNumberChange(startValue, endValue, element) {
    const duration = 600; // milliseconds
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);
    const valueChange = endValue - startValue;
    
    let frame = 0;
    const counter = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const currentValue = Math.round(startValue + easeOutQuad(progress) * valueChange);
        
        element.textContent = currentValue;
        
        if (frame === totalFrames) {
            clearInterval(counter);
            element.textContent = endValue; // Ensure we end at the exact value
        }
    }, frameDuration);
}

// Easing function for smoother animation
function easeOutQuad(x) {
    return 1 - (1 - x) * (1 - x);
}

// Open a loot box
function openBox(boxType) {
    // Store the box type being opened
    gameState.currentBox = boxType;
    
    // Check if there's an unclaimed card and automatically claim it
    if (gameState.currentCard) {
        console.log('Auto-claiming previous card before opening new box');
        
        // Store card info for notification before claiming
        const { type, rarity } = gameState.currentCard;
        const cardName = `${capitalizeFirstLetter(type)} (${capitalizeFirstLetter(rarity)})`;
        
        // Claim the card
        claimCard();
        
        // Add a small delay before opening the new box
        setTimeout(() => {
            openBoxProcess(boxType);
        }, 500);
        return;
    }
    
    // Proceed with opening the box
    openBoxProcess(boxType);
}

// Process of opening a loot box
function openBoxProcess(boxType) {
    // Get the box data
    const box = boxTypes[boxType];
    if (!box) {
        console.error('Invalid box type:', boxType);
        return;
    }
    
    // Check if user has enough coins
    if (gameState.coins < box.cost) {
        showNotification(`Not enough coins! You need ${box.cost} coins.`, 'error');
        return;
    }
    
    // Get the box element
    const boxElement = document.getElementById(`${boxType}Box`);
    if (!boxElement) {
        console.error(`Box element not found for type: ${boxType}`);
        return;
    }
    
    // Get the box image element
    const boxImage = boxElement.querySelector('.box-image');
    if (!boxImage) {
        console.error('Box image element not found');
        return;
    }
    
    // Deduct coins
    gameState.coins -= box.cost;
    updateCoinsDisplay();
    saveGame();
    
    // Play box opening sound
    const boxAudio = new Audio('SoundEffects/OpenBox.mp3');
    boxAudio.volume = 0.5;
    boxAudio.play().catch(e => console.log('Box audio play failed:', e));
    
    // Show opening animation
    boxElement.classList.add('opening-animation');
    
    // Change the box image after the shaking animation completes
    setTimeout(() => {
        boxImage.src = `Box/${boxType.charAt(0).toUpperCase() + boxType.slice(1)}Box-open.png`;
    }, 600);
    
    // Generate random card after the full animation sequence
    setTimeout(() => {
        boxElement.classList.remove('opening-animation');
        console.log('Generating random card for box type:', boxType);
        const card = generateRandomCard(boxType);
        console.log('Generated card:', card);
        gameState.currentCard = card;
        displayCard(card);
        showCardReveal();
    }, 1200); // Increased from 1000 to 1200 to match our new animation duration
}

// Generate a random card
function generateRandomCard(boxType) {
    // Randomly select card category (character, weapon, or instrument)
    const categoryRoll = Math.random();
    let category;
    if (categoryRoll < 0.33) {
        category = 'character';
    } else if (categoryRoll < 0.66) {
        category = 'weapon';
    } else {
        category = 'instrument';
    }
    
    // Randomly select card type within the category
    const typeIndex = Math.floor(Math.random() * cardTypes[category].length);
    const type = cardTypes[category][typeIndex];
    
    // Get the box's rarity distribution
    const box = boxTypes[boxType] || boxTypes.conqueror; // Default to conqueror if box type not found
    const rarityDistribution = box.rarities;
    
    // Randomly select rarity based on the box's distribution
    const rarityRoll = Math.random();
    let rarity;
    let cumulativeProbability = 0;
    
    // Loop through each rarity in the distribution
    for (const [rarityName, probability] of Object.entries(rarityDistribution)) {
        cumulativeProbability += probability;
        if (rarityRoll < cumulativeProbability) {
            rarity = rarityName;
            break;
        }
    }
    
    // Fallback to classic if somehow no rarity was selected
    if (!rarity) {
        rarity = 'classic';
    }
    
    // Create and return card object
    return {
        category,
        type,
        rarity,
        value: rarityValues[rarity],
        id: `${type}-${rarity}`
    };
}

// Display card in the reveal section
function displayCard(card) {
    const { category, type, rarity, value } = card;
    const imagePath = getCardImagePath(category, type, rarity);
    const cardId = `${category}-${type}-${rarity}`;
    
    // Check if this is a new card the player doesn't have in their collection
    let isNewCard = false;
    
    // Check if the player has this card in their collection
    if (gameState.collection[category] && gameState.collection[category][type]) {
        // Check if this specific card (by category, type, and rarity) is in the collection
        const cardInCollection = gameState.collection[category][type].some(cardId => {
            return cardId === `${type}-${rarity}`;
        });
        
        // It's a new card if it's not in the collection
        isNewCard = !cardInCollection;
    } else {
        // If the category or type doesn't exist in the collection, it's definitely new
        isNewCard = true;
    }
    
    // Set card image
    elements.revealedCard.innerHTML = `<img src="${imagePath}" alt="${type} ${rarity}">`;
    
    // Set card info
    // Display value for cards (show ??? for secret cards)
    const displayValue = rarity === 'secret' ? '???' : value;
    
    elements.cardInfo.innerHTML = `
        <h3>${capitalizeFirstLetter(type)}</h3>
        <p class="rarity ${rarity}">${capitalizeFirstLetter(rarity)}</p>
        <p class="value">${displayValue} Coins</p>
    `;
    
    // Play card reveal sound based on rarity
    playSound('reveal', rarity);
    
    // Add sparkle effect for rare cards
    if (['legendary', 'mythic', 'secret', 'supreme', 'epic'].includes(rarity)) {
        // Add sparkle effect to the card itself
        addSparkleEffect(elements.revealedCard);
        
        // Add enhanced firework effect to the modal for rare cards
        addFireworkEffect(elements.cardReveal, rarity);
    }
    
    // Add NEW! stamp if this is a new card
    if (isNewCard) {
        // Remove any existing stamp first
        const existingStamp = document.querySelector('.new-stamp');
        if (existingStamp) {
            existingStamp.remove();
        }
        
        // Create and add the NEW! stamp with color matching the card rarity
        const newStamp = document.createElement('div');
        newStamp.className = 'new-stamp';
        newStamp.textContent = 'NEW!';
        
        // Set background gradient based on card rarity
        // Define gradient colors for each rarity
        const rarityGradients = {
            classic: 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
            sliver: 'linear-gradient(135deg, #bdc3c7, #95a5a6)',
            gold: 'linear-gradient(135deg, #f39c12, #d35400)',
            rare: 'linear-gradient(135deg, #3498db, #2980b9)',
            supreme: 'linear-gradient(135deg, #2ecc71, #27ae60)',
            epic: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
            legendary: 'linear-gradient(135deg, #f1c40f, #f39c12)',
            mythic: 'linear-gradient(135deg, #e74c3c, #c0392b)',
            secret: 'linear-gradient(135deg, #1abc9c, #16a085)'
        };
        
        // Apply the gradient based on card rarity
        newStamp.style.background = rarityGradients[rarity] || 'linear-gradient(135deg, #ff5e62, #ff9966)';
        
        // Position the stamp in the top-right corner of the card
        newStamp.style.position = 'absolute';
        newStamp.style.top = '-25px';
        newStamp.style.right = '-25px';
        newStamp.style.zIndex = '9999'; // Ensure it's above everything
        
        // Set the correct size and styling
        newStamp.style.padding = '10px 15px';
        newStamp.style.fontSize = '1.2rem';
        newStamp.style.fontWeight = 'bold';
        newStamp.style.borderRadius = '50%';
        newStamp.style.transform = 'rotate(15deg)';
        newStamp.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.5)';
        newStamp.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.5)';
        newStamp.style.border = '3px solid white';
        newStamp.style.color = 'white';
        newStamp.style.animation = 'stamp-animation 1.5s infinite';
        newStamp.style.pointerEvents = 'none'; // Prevent it from blocking interactions
        
        // Add to the card container instead of the body
        elements.cardReveal.appendChild(newStamp);
        
        // Ensure the container doesn't clip the stamp
        elements.cardReveal.style.overflow = 'visible';
        
        // No need to track seen cards separately anymore
        // We're checking the collection directly
        saveGame();
    }
    
    // Add 3D perspective effect based on mouse movement
    add3DCardEffect();
}

// Add 3D perspective effect to the card based on mouse movement
function add3DCardEffect(targetCard, targetContainer) {
    console.log('Adding 3D card effect');
    
    // Get the card and card container elements
    const card = targetCard || document.querySelector('#revealedCard');
    const cardModal = targetContainer || document.querySelector('#cardModal');
    
    if (!card || !cardModal) {
        console.error('Card or card modal elements not found');
        return;
    }
    
    console.log('Card and modal elements found');
    
    // Make sure the card has the necessary CSS properties
    card.style.transformStyle = 'preserve-3d';
    card.style.transition = 'transform 0.15s cubic-bezier(0.33, 1, 0.68, 1)';
    
    // Set initial reflection properties
    card.style.setProperty('--reflection-angle', '130deg');
    card.style.setProperty('--reflection-opacity', '0.2');
    
    // Remove any existing event listeners to prevent duplicates
    const existingHandler = card.getAttribute('data-3d-handler');
    if (existingHandler) {
        cardModal.removeEventListener('mousemove', window[existingHandler]);
        cardModal.removeEventListener('mouseleave', window[existingHandler + 'Leave']);
    }
    
    // Create a unique handler name for this instance
    const handlerName = 'handle3DEffect_' + Date.now();
    
    // Define the handler function
    window[handlerName] = function(e) {
        const rect = cardModal.getBoundingClientRect();
        
        // Calculate mouse position relative to the card modal (0 to 1)
        const mouseX = (e.clientX - rect.left) / rect.width;
        const mouseY = (e.clientY - rect.top) / rect.height;
        
        // Calculate rotation angles with easing for more natural movement
        // Use 15 degrees as maximum rotation for more noticeable effect
        const maxRotation = 15;
        
        // Apply non-linear easing for more natural movement
        // Convert 0-1 range to -1 to 1 range, then apply cubic easing
        const easeX = (mouseX * 2 - 1);
        const easeY = (mouseY * 2 - 1);
        
        // Invert X rotation for natural tilt (tilt top toward mouse)
        const rotateX = -easeY * maxRotation;
        // Y rotation follows mouse horizontal movement
        const rotateY = easeX * maxRotation;
        
        // Apply the 3D transform
        card.style.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
        
        // Update reflection effect based on the card's tilt
        const baseAngle = 130;
        const reflectionAngle = baseAngle - (rotateX * 3) - (rotateY * 2);
        // Reduce maximum intensity from 0.4 to 0.25 for a more subtle effect
        const reflectionIntensity = Math.min(0.25, 0.08 + (Math.abs(rotateX) + Math.abs(rotateY)) / 25);
        
        // Apply custom reflection style
        card.style.setProperty('--reflection-angle', `${reflectionAngle}deg`);
        card.style.setProperty('--reflection-opacity', reflectionIntensity);
        
        console.log(`3D transform applied: rotateY(${rotateY.toFixed(2)}deg) rotateX(${rotateX.toFixed(2)}deg)`);
    };
    
    // Define the leave handler
    window[handlerName + 'Leave'] = function() {
        card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
        card.style.setProperty('--reflection-angle', '130deg');
        card.style.setProperty('--reflection-opacity', '0.2');
    };
    
    // Store the handler name as a data attribute
    card.setAttribute('data-3d-handler', handlerName);
    
    // Add event listeners
    cardModal.addEventListener('mousemove', window[handlerName]);
    cardModal.addEventListener('mouseleave', window[handlerName + 'Leave']);
    
    console.log('3D effect event listeners attached');
}

// Add sparkle effect to an element
function addSparkleEffect(element) {
    // Create sparkle container if it doesn't exist
    let sparkleContainer = document.getElementById('sparkleContainer');
    if (!sparkleContainer) {
        sparkleContainer = document.createElement('div');
        sparkleContainer.id = 'sparkleContainer';
        document.body.appendChild(sparkleContainer);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                z-index: 100;
                justify-content: center;
                align-items: center;
                flex-direction: column;
            }
            .sparkle {
                position: absolute;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background-color: white;
                box-shadow: 0 0 10px 2px gold;
                opacity: 0;
                animation: sparkle-animation 1s ease forwards;
            }
            @keyframes sparkle-animation {
                0% { transform: scale(0); opacity: 0; }
                50% { transform: scale(1); opacity: 1; }
                100% { transform: scale(0); opacity: 0; }
            }
            
            /* Firework styles */
            .firework {
                position: absolute;
                width: 5px;
                height: 5px;
                border-radius: 50%;
                transform: scale(0);
                pointer-events: none;
                z-index: 100; /* Ensure fireworks are visible on top */
            }
            
            .firework-particle {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                transform-origin: center;
                opacity: 0;
            }
            
            @keyframes firework-explosion {
                0% { transform: scale(0); opacity: 1; }
                50% { transform: scale(1); opacity: 1; }
                100% { transform: scale(1.2); opacity: 0; }
            }
            
            @keyframes particle-explosion {
                0% { transform: translate(0, 0) scale(1); opacity: 1; }
                100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Get element position
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Create sparkles
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            
            // Random position around the card
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 150 + 50;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            // Random color
            const colors = ['gold', 'white', '#f39c12', '#e74c3c', '#3498db'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            sparkle.style.left = `${x}px`;
            sparkle.style.top = `${y}px`;
            sparkle.style.backgroundColor = color;
            sparkle.style.boxShadow = `0 0 10px 2px ${color}`;
            
            sparkleContainer.appendChild(sparkle);
            
            // Remove sparkle after animation
            setTimeout(() => {
                sparkle.remove();
            }, 1000);
        }, i * 50);
    }
}

// Add enhanced firework effect for rare cards
function addFireworkEffect(container, rarity) {
    // Define color palettes based on rarity
    const rarityColors = {
        legendary: ['#f1c40f', '#f39c12', '#e67e22', '#FFD700', '#FFA500'],
        mythic: ['#e74c3c', '#c0392b', '#FF5733', '#FF0000', '#8B0000'],
        secret: ['#1abc9c', '#16a085', '#00FFFF', '#008080', '#00CED1'],
        supreme: ['#2ecc71', '#27ae60', '#00FF00', '#008000', '#32CD32'],
        epic: ['#9b59b6', '#8e44ad', '#800080', '#4B0082', '#9400D3']
    };
    
    // Use default colors if rarity not found
    const colors = rarityColors[rarity] || ['#f39c12', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6'];
    
    // Get container dimensions
    const rect = container.getBoundingClientRect();
    
    // Significantly increased number of fireworks based on rarity
    const fireworkCount = {
        legendary: 20,
        mythic: 18,
        secret: 16,
        supreme: 14,
        epic: 12
    }[rarity] || 10;
    
    // Use the existing container for fireworks instead of creating a new one
    // This ensures proper positioning relative to the modal
    container.style.position = 'relative'; // Ensure container has relative positioning
    container.style.overflow = 'hidden'; // Ensure fireworks don't overflow
    
    // Create a firework container that's absolutely positioned within the modal
    const fireworkContainer = document.createElement('div');
    fireworkContainer.style.position = 'absolute';
    fireworkContainer.style.top = '0';
    fireworkContainer.style.left = '0';
    fireworkContainer.style.right = '0';
    fireworkContainer.style.bottom = '0';
    fireworkContainer.style.pointerEvents = 'none';
    fireworkContainer.style.zIndex = '50';
    fireworkContainer.className = 'firework-container';
    container.appendChild(fireworkContainer);
    
    // Function to create a single firework at a random position
    const createFirework = () => {
        // Create random position for firework within the container
        // Use percentage-based positioning for better coverage across the entire modal
        const xPercent = Math.random() * 100;
        const yPercent = Math.random() * 100;
        
        // Create firework element
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.position = 'absolute';
        firework.style.left = `${xPercent}%`;
        firework.style.top = `${yPercent}%`;
        firework.style.width = `${5 + Math.random() * 5}px`; // Varied sizes
        firework.style.height = firework.style.width;
        firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        firework.style.boxShadow = `0 0 20px 5px ${firework.style.backgroundColor}`;
        firework.style.animation = `firework-explosion ${0.6 + Math.random() * 0.4}s ease-out forwards`;
        
        fireworkContainer.appendChild(firework);
        
        // Create particles for this firework
        const particleCount = 20 + Math.floor(Math.random() * 15);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';
            
            // Random angle and distance
            const angle = (Math.PI * 2) * (i / particleCount);
            const distance = 50 + Math.random() * 50;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            // Random color from the palette
            const particleColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Set particle styles
            particle.style.backgroundColor = particleColor;
            particle.style.boxShadow = `0 0 4px 2px ${particleColor}`;
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            particle.style.animation = `particle-explosion ${0.5 + Math.random() * 0.5}s ease-out forwards`;
            particle.style.animationDelay = `0.1s`;
            
            firework.appendChild(particle);
        }
        
        // Remove firework after animation completes
        setTimeout(() => {
            firework.remove();
        }, 2000);
    };
    
    // Create initial burst of fireworks
    for (let f = 0; f < fireworkCount / 2; f++) {
        setTimeout(() => {
            createFirework();
        }, f * 150); // Faster initial burst
    }
    
    // Continue with more fireworks at a slower pace
    for (let f = 0; f < fireworkCount / 2; f++) {
        setTimeout(() => {
            createFirework();
        }, (fireworkCount / 2) * 150 + f * 300); // Slower follow-up fireworks
    }
    
    // Clean up the container after all fireworks are done
    setTimeout(() => {
        if (fireworkContainer && fireworkContainer.parentNode) {
            fireworkContainer.remove();
        }
    }, (fireworkCount / 2) * 150 + (fireworkCount / 2) * 300 + 2000);
}

// Show card reveal modal
function showCardReveal() {
    console.log('Showing card reveal modal');
    if (elements.cardModal) {
        elements.cardModal.style.display = 'flex';
        if (elements.claimCardBtn) {
            elements.claimCardBtn.style.display = 'block';
        }
        
        // Ensure 3D effect is applied after modal is visible
        setTimeout(() => {
            add3DCardEffect();
        }, 100);
    } else {
        console.error('Card modal element not found');
    }
}

// Hide card reveal modal with fade-out animation
function hideCardReveal() {
    // Add the fade-out class to animate the background from dark to bright
    elements.cardModal.classList.add('fade-out');
    
    // Wait for the animation to complete before hiding the modal
    setTimeout(() => {
        elements.cardModal.style.display = 'none';
        // Remove the fade-out class so it's ready for next time
        elements.cardModal.classList.remove('fade-out');
        
        // Reset currentCard to null so new boxes can be opened
        // This is important if the user closes the modal without claiming
        gameState.currentCard = null;
        
        // Reset all box images back to closed position
        resetBoxImages();
    }, 300); // Match the faster transition duration in CSS (0.3s = 300ms)
}

// Reset all box images back to closed position
function resetBoxImages() {
    // Get all box elements and reset their images to closed state
    const boxTypes = ['conqueror', 'maestro', 'visionary'];
    
    boxTypes.forEach(boxType => {
        const boxElement = document.getElementById(`${boxType}Box`);
        if (boxElement) {
            const boxImage = boxElement.querySelector('.box-image');
            if (boxImage) {
                boxImage.src = `Box/${boxType.charAt(0).toUpperCase() + boxType.slice(1)}Box-close.png`;
            }
        }
    });
    const newStamp = document.querySelector('.new-stamp');
    if (newStamp) {
        newStamp.remove();
    }
}

// Claim the card (add to collection)
function claimCard() {
    console.log('Claim card function called, currentCard:', gameState.currentCard);
    
    // Check if there's a card to claim
    if (!gameState.currentCard) {
        console.log('No card to claim');
        hideCardReveal();
        return;
    }
    
    try {
        const { category, type, id, rarity } = gameState.currentCard;
        
        // Make sure collection object is properly initialized
        if (!gameState.collection[category]) {
            gameState.collection[category] = {};
        }
        
        if (!gameState.collection[category][type]) {
            gameState.collection[category][type] = [];
        }
        
        // Add card to collection (even if duplicate)
        gameState.collection[category][type].push(id);
        
        // No sound here - sound will be played directly from the button click
        
        // Show notification with card rarity color
        showNotification(`Added ${capitalizeFirstLetter(type)} (${capitalizeFirstLetter(rarity)}) to collection!`, 'success', rarity);
        
        // Check if set is complete
        checkSetCompletion(category, type);
        
        // Update collection display
        renderCollection();
        updateCollectionStats();
        
        // Save game
        saveGame();
        
        // Update the collection stats to show the last card
        updateCollectionStats();
    } catch (error) {
        console.error('Error in claimCard function:', error);
    }
    
    // Hide the modal
    hideCardReveal();
    
    // Reset all box images back to closed position
    resetBoxImages();
    
    // Reset currentCard to null so new boxes can be opened
    gameState.currentCard = null;
}

// Count how many of a specific card the user has
function getCardCount(category, type, cardId) {
    if (!gameState.collection[category] || !gameState.collection[category][type]) {
        return 0;
    }
    
    return gameState.collection[category][type].filter(id => id === cardId).length;
}

// Check if a set is complete
function checkSetCompletion(category, type) {
    const setId = `${category}-${type}`;
    
    // If set already marked as complete, return
    if (gameState.completedSets.includes(setId)) return;
    
    // Check if all rarities are collected
    const collectedCards = gameState.collection[category][type] || [];
    
    // Get unique rarities from the collection
    const uniqueRarities = new Set();
    collectedCards.forEach(cardId => {
        // Card IDs are in the format 'type-rarity'
        const rarity = cardId.split('-')[1];
        if (rarity) uniqueRarities.add(rarity);
    });
    
    // Check if all rarities are in the unique set
    const isComplete = rarities.every(rarity => uniqueRarities.has(rarity));
    
    // Debug logging
    console.log(`Checking set completion for ${category}-${type}:`);
    console.log(`Unique rarities collected: ${Array.from(uniqueRarities).join(', ')}`);
    console.log(`All rarities needed: ${rarities.join(', ')}`);
    console.log(`Is complete: ${isComplete}`);
    
    // Only proceed if truly complete - must have ALL rarities
    if (isComplete && uniqueRarities.size === rarities.length) {
        // Mark set as complete
        gameState.completedSets.push(setId);
        
        // Give reward
        const reward = 1000; // Reward for completing a set
        gameState.coins += reward;
        updateCoinsDisplay();
        
        // Show completion modal
        showCompletionModal(category, type, reward);
        
        // Save game
        saveGame();
    }
}

// Show completion modal
function showCompletionModal(category, type, reward) {
    elements.completionMessage.innerHTML = `You've completed the <span class="set-name">${capitalizeFirstLetter(type)} ${category}</span> set!`;
    elements.rewardAmount.textContent = reward;
    elements.completionModal.style.display = 'flex';
    
    // Play the local completion sound effect
    playSound('complete');
}

// Close modal
function closeModal() {
    console.log('Close modal button clicked');
    // Make sure the completionModal element exists before trying to hide it
    if (elements.completionModal) {
        elements.completionModal.style.display = 'none';
    } else {
        console.error('Completion modal element not found');
    }
    
    // Also check if there are any other visible modals that need to be closed
    const allModals = document.querySelectorAll('.modal');
    allModals.forEach(modal => {
        if (modal.style.display === 'flex' || modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
}

// Update collection statistics
function updateCollectionStats() {
    // Count total cards
    let totalCardCount = 0;
    let lastCardName = 'None';
    let lastCardRarity = '';
    
    // Check if there's a current card to display as the last card
    if (gameState.currentCard) {
        const { type, rarity } = gameState.currentCard;
        lastCardName = `${capitalizeFirstLetter(type)} (${capitalizeFirstLetter(rarity)})`;
        lastCardRarity = rarity;
    }
    
    // Loop through all collections to count total cards
    for (const category in gameState.collection) {
        for (const type in gameState.collection[category]) {
            const cards = gameState.collection[category][type];
            totalCardCount += cards.length;
        }
    }
    
    // Update UI
    elements.totalCards.textContent = totalCardCount;
    elements.completedSetsCount.textContent = gameState.completedSets.length;
    
    if (lastCardName !== 'None') {
        elements.rarestCard.textContent = lastCardName;
        elements.rarestCard.className = lastCardRarity;
    } else {
        elements.rarestCard.textContent = 'None';
        elements.rarestCard.className = '';
    }
}

// Global variable to track notification timeout
let notificationTimeout = null;

// Show notification
function showNotification(message, type = 'info', cardType = null) {
    // Clear any existing notification timeout
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
        notificationTimeout = null;
    }
    
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        document.body.appendChild(notification);
        
        // Add styles inline (could be moved to CSS file)
        const style = document.createElement('style');
        style.textContent = `
            #notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 5px;
                color: white;
                font-weight: bold;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                opacity: 0;
                transition: all 0.3s ease;
                transform: translateY(20px);
            }
            #notification.show {
                opacity: 1;
                transform: translateY(0);
            }
            #notification.success { background-color: #2ecc71; }
            #notification.error { background-color: #e74c3c; }
            #notification.info { background-color: #3498db; }
            #notification.common { background-color: #95a5a6; }
            #notification.uncommon { background-color: #3498db; }
            #notification.rare { background-color: #9b59b6; }
            #notification.epic { background-color: #e67e22; }
            #notification.legendary { background-color: #f1c40f; }
        `;
        document.head.appendChild(style);
    } else {
        // If notification exists, hide it first before showing new one
        notification.classList.remove('show');
    }
    
    // Set notification content and type
    notification.textContent = message;
    
    // If a card type is provided, use that for styling instead of the default type
    if (cardType && ['classic', 'sliver', 'gold', 'rare', 'supreme', 'epic', 'legendary', 'mythic', 'secret'].includes(cardType)) {
        notification.className = cardType;
    } else {
        notification.className = type;
    }
    
    // Show notification after a short delay to ensure any hide animation completes
    setTimeout(() => {
        notification.classList.add('show');
        
        // Hide notification after 3 seconds
        notificationTimeout = setTimeout(() => {
            notification.classList.remove('show');
            notificationTimeout = null;
        }, 3000);
    }, 50);
}

// Play sound effects
function playSound(type, rarity = '') {
    console.log('Playing sound:', type);
    
    // Define sound file mappings
    const soundFiles = {
        open: 'SoundEffects/OpenBox.mp3',
        collect: 'SoundEffects/Claim.mp3',
        sell: 'SoundEffects/Selling.wav',
        complete: 'SoundEffects/CompleteASet.mp3',
        slotMachine: 'SoundEffects/SlotMachine.mp3',
        success: 'SoundEffects/Selling.wav'
    };
    
    // Define online sound files for types we don't have local files for
    const onlineSounds = {
        hover: 'https://assets.mixkit.co/sfx/preview/mixkit-quick-win-video-game-notification-269.mp3',
        click: 'https://assets.mixkit.co/sfx/preview/mixkit-modern-click-box-check-1120.mp3',
        reveal: {
            high: 'https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3', // legendary, mythic, secret
            medium: 'https://assets.mixkit.co/sfx/preview/mixkit-fairy-arcade-sparkle-866.mp3', // epic, supreme
            low: 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3' // others
        }
    };
    
    // Skip hover sounds for now
    if (type === 'hover') {
        return;
    }
    
    // Determine which sound URL to use
    let soundUrl = '';
    
    if (soundFiles[type]) {
        // Use local sound file if available
        soundUrl = soundFiles[type];
    } else if (type === 'reveal') {
        // Handle reveal sounds based on rarity
        if (rarity === 'legendary' || rarity === 'mythic' || rarity === 'secret') {
            soundUrl = onlineSounds.reveal.high;
        } else if (rarity === 'epic' || rarity === 'supreme') {
            soundUrl = onlineSounds.reveal.medium;
        } else {
            soundUrl = onlineSounds.reveal.low;
        }
    } else if (onlineSounds[type]) {
        // Use online sound as fallback
        soundUrl = typeof onlineSounds[type] === 'string' ? onlineSounds[type] : onlineSounds[type].low;
    } else {
        // No sound found for this type
        console.warn('No sound defined for type:', type);
        return;
    }
    
    // Create and play audio
    try {
        console.log('Playing sound URL:', soundUrl);
        const audio = new Audio(soundUrl);
        audio.volume = 0.5; // 50% volume
        audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
        console.error('Error playing sound:', error);
    }
}

// Render collection
function renderCollection() {
    renderCategoryCollection('character');
    renderCategoryCollection('weapon');
    renderCategoryCollection('instrument');
    
    // Update collection stats
    updateCollectionStats();
}

// Render category collection
function renderCategoryCollection(category) {
    try {
        console.log('Rendering category collection for:', category);
        
        let container;
        if (category === 'character') {
            container = elements.characterSets;
        } else if (category === 'weapon') {
            container = elements.weaponSets;
        } else if (category === 'instrument') {
            container = elements.instrumentSets;
        }
        
        if (!container) {
            console.error(`Container for ${category} not found`);
            return;
        }
        
        container.innerHTML = '';
        
        // Make sure the collection object is properly initialized
        if (!gameState.collection[category]) {
            gameState.collection[category] = {};
        }
        
        cardTypes[category].forEach(type => {
            const setId = `${category}-${type}`;
            const isComplete = gameState.completedSets.includes(setId);
            const collectedCards = gameState.collection[category][type] || [];
            
            // Count unique rarities instead of total cards
            const uniqueRarities = new Set();
            collectedCards.forEach(cardId => {
                // Card IDs are in the format 'type-rarity'
                const rarity = cardId.split('-')[1];
                if (rarity) uniqueRarities.add(rarity);
            });
            const completionCount = uniqueRarities.size;
            
            // Create set element
            const setElement = document.createElement('div');
            setElement.className = `card-set ${isComplete ? 'complete' : ''}`;
            setElement.innerHTML = `
                <h3 class="set-title">${capitalizeFirstLetter(type)}</h3>
                <p class="set-completion ${isComplete ? 'complete' : ''}">Collection: ${completionCount}/9 ${isComplete ? '✓' : ''}</p>
                <div class="set-cards" id="${setId}-cards"></div>
            `;
            
            // Developer feature: Add click counter to set title to remove all cards in the set (hidden from tooltip)
            const setTitle = setElement.querySelector('.set-title');
            if (setTitle) {
                setTitle.dataset.clickCount = '0';
                setTitle.title = `${capitalizeFirstLetter(type)}`;
                setTitle.style.cursor = 'pointer';
                
                setTitle.addEventListener('click', () => {
                    let clickCount = parseInt(setTitle.dataset.clickCount) || 0;
                    clickCount++;
                    setTitle.dataset.clickCount = clickCount;
                    
                    // Keep the tooltip simple without revealing the developer feature
                    setTitle.title = `${capitalizeFirstLetter(type)}`;

                    
                    if (clickCount >= 5) {
                        // Only remove cards if in developer mode
                        if (gameState.developerMode) {
                            // Remove all cards in this set
                            if (gameState.collection[category][type] && gameState.collection[category][type].length > 0) {
                                // Store the original count for the notification
                                const originalCount = gameState.collection[category][type].length;
                                
                                // Clear the collection for this type
                                gameState.collection[category][type] = [];
                                
                                // Remove from completed sets if it was completed
                                const setIndex = gameState.completedSets.indexOf(setId);
                                if (setIndex !== -1) {
                                    gameState.completedSets.splice(setIndex, 1);
                                }
                                
                                // Show notification
                                showNotification(`Developer: Removed all ${originalCount} ${capitalizeFirstLetter(type)} cards!`, 'error');
                                
                                // Update collection display
                                renderCollection();
                                updateCollectionStats();
                                
                                // Save game
                                saveGame();
                            } else {
                                showNotification(`No ${capitalizeFirstLetter(type)} cards to remove`, 'info');
                            }
                        } else {
                            // Silently do nothing if not in developer mode
                        }
                        
                        // Reset click count
                        setTitle.dataset.clickCount = '0';
                    }
                });
            }
            
            container.appendChild(setElement);
            
            // Add cards to set
            const setCardsContainer = document.getElementById(`${setId}-cards`);
            if (!setCardsContainer) {
                console.error(`Cards container for ${setId} not found`);
                return;
            }
            
            rarities.forEach(rarity => {
                const cardId = `${type}-${rarity}`;
                const hasCard = collectedCards.includes(cardId);
                
                const cardElement = document.createElement('div');
                cardElement.className = `set-card ${hasCard ? rarity : 'locked'}`;
                
                if (hasCard) {
                    // Count how many of this card the user has
                    const cardCount = getCardCount(category, type, cardId);
                    
                    // Create the HTML with the card image
                    cardElement.innerHTML = `<img src="${getCardImagePath(category, type, rarity)}" alt="${type} ${rarity}">`;
                    
                    // Add count badge if user has more than one of this card
                    if (cardCount > 1) {
                        const countBadge = document.createElement('div');
                        countBadge.className = 'card-count-badge';
                        countBadge.textContent = `x${cardCount}`;
                        cardElement.appendChild(countBadge);
                    }
                    
                    // Add tooltip with card info
                    cardElement.title = `${capitalizeFirstLetter(type)} - ${capitalizeFirstLetter(rarity)}
Value: ${rarityValues[rarity]} coins`;
                    
                    // Add click event to show card details
                    cardElement.addEventListener('click', () => {
                        showCardDetails(category, type, rarity);
                    });
                } else {
                    // Developer feature: Add click counter to empty card slots (hidden from tooltip)
                    cardElement.dataset.clickCount = '0';
                    cardElement.title = `${capitalizeFirstLetter(type)} - ${capitalizeFirstLetter(rarity)}`;
                    
                    // Add click event to count clicks and claim card after 5 clicks
                    cardElement.addEventListener('click', () => {
                        let clickCount = parseInt(cardElement.dataset.clickCount) || 0;
                        clickCount++;
                        cardElement.dataset.clickCount = clickCount;
                        
                        // Keep the tooltip simple without revealing the developer feature
                        cardElement.title = `${capitalizeFirstLetter(type)} - ${capitalizeFirstLetter(rarity)}`;

                        
                        if (clickCount >= 5) {
                            // Only add card if in developer mode
                            if (gameState.developerMode) {
                                // Add card to collection
                                if (!gameState.collection[category][type]) {
                                    gameState.collection[category][type] = [];
                                }
                                
                                // Add the card if it doesn't exist
                                if (!gameState.collection[category][type].includes(cardId)) {
                                    gameState.collection[category][type].push(cardId);
                                    
                                    // Show notification
                                    showNotification(`Developer: Added ${capitalizeFirstLetter(type)} (${capitalizeFirstLetter(rarity)}) to collection!`, 'success', rarity);
                                    
                                    // Check if set is complete
                                    checkSetCompletion(category, type);
                                    
                                    // Update collection display
                                    renderCollection();
                                    updateCollectionStats();
                                    
                                    // Save game
                                    saveGame();
                                }
                            } else {
                                // Silently reset the click count if not in developer mode
                                cardElement.dataset.clickCount = '0';
                            }
                        }
                    });
                }
                
                setCardsContainer.appendChild(cardElement);
            });
        });
    } catch (error) {
        console.error('Error in renderCategoryCollection:', error);
    }
}

// Show card details when clicked in collection
function showCardDetails(category, type, rarity) {
    const cardId = `${type}-${rarity}`;
    const imagePath = getCardImagePath(category, type, rarity);
    const value = rarityValues[rarity];
    const cardCount = getCardCount(category, type, cardId);
    const canSell = cardCount > 1;
    
    // Create modal if it doesn't exist
    let cardModal = document.getElementById('cardDetailModal');
    if (!cardModal) {
        cardModal = document.createElement('div');
        cardModal.id = 'cardDetailModal';
        cardModal.className = 'card-modal'; // Use card-modal class instead of modal
        
        document.body.appendChild(cardModal);
    }
    
    // Get drop rate percentage based on rarity
    let dropRate = '';
    switch(rarity) {
        case 'classic': dropRate = '55.0%'; break;
        case 'silver': dropRate = '20.0%'; break;
        case 'gold': dropRate = '10.0%'; break;
        case 'rare': dropRate = '6.0%'; break;
        case 'supreme': dropRate = '3.5%'; break;
        case 'epic': dropRate = '2.5%'; break;
        case 'legendary': dropRate = '1.8%'; break;
        case 'mythic': dropRate = '0.9%'; break;
        case 'secret': dropRate = '0.3%'; break;
        default: dropRate = 'Unknown';
    }

    // Display value for cards (show ??? for secret cards)
    const displayValue = rarity === 'secret' ? '???' : value;

    // Create modal for card details
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content card-modal-content';
    modalContent.innerHTML = `
        <div class="card-container horizontal">
            <div class="card" data-3d-handler="handle3DEffect_${Date.now()}">
                <img src="${imagePath}" alt="${type} ${rarity}" class="card-preview-img">
            </div>
            <div class="card-info">
                <h3>${capitalizeFirstLetter(type)}</h3>
                <p class="rarity ${rarity}">${capitalizeFirstLetter(rarity)}</p>
                <p class="value">${displayValue} Coins</p>
                <p class="card-count">X${cardCount} ${gameState.developerMode ? '<button id="addCardBtn" class="dev-add-card-btn">+</button>' : ''}</p>
                <p class="card-description">This ${rarity} ${type} card is part of the ${category} collection.</p>
                <p class="card-drop-rate">Drop Rate: <span class="drop-rate-value ${rarity}">${dropRate}</span></p>
            </div>
        </div>
        <div class="button-container">
            <button id="sellFromCollectionBtn" ${canSell ? 'class="claim-btn"' : 'disabled class="disabled-btn"'}>
                ${canSell ? `Sell one for ${displayValue} Coins` : 'You can\'t sell your last one'}
            </button>
            <button id="closeCardDetailBtn" class="claim-btn close-btn">Close</button>
        </div>
    `;
    cardModal.innerHTML = '';
    cardModal.appendChild(modalContent);

    // Slot machine modal is now created in slotMachine.js

    // Show modal
    cardModal.style.display = 'flex';
    cardModal.style.justifyContent = 'center';
    cardModal.style.alignItems = 'center';
    cardModal.style.zIndex = '1000'; // Ensure high z-index to overlay everything

    // Add 3D effect to the card
    const detailCard = cardModal.querySelector('.card');
    if (detailCard) {
        // Apply the same 3D effect as in the card reveal modal
        add3DCardEffect(detailCard, cardModal);
    }
    
    // Create full-resolution preview modal if it doesn't exist
    let fullPreviewModal = document.getElementById('fullCardPreviewModal');
    if (!fullPreviewModal) {
        fullPreviewModal = document.createElement('div');
        fullPreviewModal.id = 'fullCardPreviewModal';
        fullPreviewModal.className = 'full-preview-modal';
        fullPreviewModal.innerHTML = `
            <div class="full-preview-container">
                <img id="fullCardImage" src="" alt="Full card preview">
            </div>
        `;
        document.body.appendChild(fullPreviewModal);
        
        // Also close when clicking outside the image
        fullPreviewModal.addEventListener('click', (e) => {
            if (e.target === fullPreviewModal) {
                fullPreviewModal.classList.remove('show');
            }
        });
    }
    
    // Add event listeners for buttons
    document.getElementById('closeCardDetailBtn').addEventListener('click', () => {
        // Add fade-out class for smooth transition
        cardModal.classList.add('fade-out');
        
        // Wait for animation to complete before hiding
        setTimeout(() => {
            cardModal.style.display = 'none';
            // Remove the fade-out class so it's ready for next time
            cardModal.classList.remove('fade-out');
        }, 300); // Match the faster transition duration in CSS (0.3s = 300ms)
    });
    
    // Add functionality for the + button in developer mode
    const addCardBtn = document.getElementById('addCardBtn');
    if (addCardBtn && gameState.developerMode) {
        addCardBtn.addEventListener('click', () => {
            // Add the card to the collection
            if (!gameState.collection[category]) {
                gameState.collection[category] = {};
            }
            if (!gameState.collection[category][type]) {
                gameState.collection[category][type] = [];
            }
            
            // Add the card
            gameState.collection[category][type].push(`${type}-${rarity}`);
            
            // Update the count display
            const cardCountElement = document.querySelector('.card-count');
            if (cardCountElement) {
                const newCount = getCardCount(category, type, `${type}-${rarity}`);
                // Update the text content before the button
                cardCountElement.childNodes[0].nodeValue = `X${newCount} `;
                
                // Update the sell button state if count is now > 1
                if (newCount > 1) {
                    const sellButton = document.getElementById('sellFromCollectionBtn');
                    if (sellButton && sellButton.disabled) {
                        sellButton.disabled = false;
                        sellButton.className = 'claim-btn';
                        sellButton.textContent = `Sell one for ${rarity === 'secret' ? '???' : value} Coins`;
                        
                        // Add the sell functionality to the button
                        sellButton.addEventListener('click', function sellCardHandler() {
                            // Remove card from collection
                            const collectionArray = gameState.collection[category][type];
                            const cardId = `${type}-${rarity}`;
                            const cardIndex = collectionArray.indexOf(cardId);
                            
                            if (cardIndex !== -1) {
                                // Remove card
                                collectionArray.splice(cardIndex, 1);
                                
                                // Add value to coins
                                let sellValue = value;
                                
                                // For secret cards, show slot machine animation
                                if (rarity === 'secret') {
                                    // Use the slot machine from the external file
                                    runSlotMachineAnimation(700, 1500, (finalValue) => {
                                        // This callback runs when the user clicks 'Awesome!'
                                        sellValue = finalValue;
                                        
                                        // Show notification after closing the slot machine
                                        showNotification(`Secret card sold for ${sellValue} coins!`, 'success', 'secret');
                                        
                                        // Update game state with the coins
                                        gameState.coins += sellValue;
                                        updateCoinsDisplay();
                                        
                                        // Update the card count display
                                        const newCount = getCardCount(category, type, cardId);
                                        const cardCountElement = document.querySelector('.card-count');
                                        if (cardCountElement) {
                                            // In developer mode, we need to handle the text node differently
                                            if (gameState.developerMode) {
                                                // Replace the entire content and preserve the button
                                                const addCardBtn = cardCountElement.querySelector('#addCardBtn');
                                                cardCountElement.innerHTML = `X${newCount} `;
                                                if (addCardBtn) {
                                                    cardCountElement.appendChild(addCardBtn);
                                                }
                                            } else {
                                                // Regular update for non-developer mode
                                                cardCountElement.textContent = `X${newCount}`;
                                            }
                                        }
                                        
                                        // If this was the last card of this type, disable the sell button
                                        if (newCount <= 1) {
                                            sellButton.disabled = true;
                                            sellButton.className = 'disabled-btn';
                                            sellButton.textContent = `You can't sell your last one`;
                                            
                                            // Remove the event listener to prevent memory leaks
                                            sellButton.removeEventListener('click', sellCardHandler);
                                        }
                                        
                                        // Save game
                                        saveGame();
                                    });
                                    
                                    // Return early since we'll handle the notification after the animation
                                    return;
                                }
                                
                                gameState.coins += sellValue;
                                updateCoinsDisplay();
                                
                                // Play sell sound
                                playSound('sell');
                                
                                // For non-secret cards, we already showed the notification in the random value section
                                if (rarity !== 'secret') {
                                    showNotification(`Sold ${capitalizeFirstLetter(type)} (${capitalizeFirstLetter(rarity)}) for ${sellValue} coins!`, 'success', rarity);
                                }
                                
                                // Save game
                                saveGame();
                                
                                // Update the card count display
                                const newCount = getCardCount(category, type, cardId);
                                const cardCountElement = document.querySelector('.card-count');
                                if (cardCountElement) {
                                    // In developer mode, we need to handle the text node differently
                                    if (gameState.developerMode) {
                                        // Replace the entire content and preserve the button
                                        const addCardBtn = cardCountElement.querySelector('#addCardBtn');
                                        cardCountElement.innerHTML = `X${newCount} `;
                                        if (addCardBtn) {
                                            cardCountElement.appendChild(addCardBtn);
                                        }
                                    } else {
                                        // Regular update for non-developer mode
                                        cardCountElement.textContent = `X${newCount}`;
                                    }
                                }
                                
                                // If this was the last card of this type, disable the sell button
                                if (newCount <= 1) {
                                    sellButton.disabled = true;
                                    sellButton.className = 'disabled-btn';
                                    sellButton.textContent = `You can't sell your last one`;
                                    
                                    // Remove the event listener to prevent memory leaks
                                    sellButton.removeEventListener('click', sellCardHandler);
                                }
                            }
                        });
                    }
                }
            }
            
            // Show notification
            showNotification(`Developer: Added ${capitalizeFirstLetter(rarity)} ${capitalizeFirstLetter(type)} card to collection`, 'success', rarity);
            
            // Play sound
            playSound('reveal', rarity);
            
            // Check for set completion
            checkSetCompletion(category, type);
            
            // Save game
            saveGame();
        });
    }
    
    // Add click event to the card image for full-resolution preview
    const cardPreviewImg = document.querySelector('.card-preview-img');
    if (cardPreviewImg) {
        cardPreviewImg.addEventListener('click', () => {
            const fullCardImage = document.getElementById('fullCardImage');
            fullCardImage.src = imagePath;
            fullPreviewModal.classList.add('show');
        });
    }
    
    // Add sell functionality if the button exists
    const sellButton = document.getElementById('sellFromCollectionBtn');
    if (sellButton && !sellButton.disabled) {
        sellButton.addEventListener('click', () => {
            // Remove card from collection
            const collectionArray = gameState.collection[category][type];
            const cardIndex = collectionArray.indexOf(cardId);
            
            if (cardIndex !== -1) {
                // Remove card from collection
                collectionArray.splice(cardIndex, 1);
                
                // Add value to coins
                let sellValue = value;
                
                // For secret cards, show slot machine animation
                if (rarity === 'secret') {
                    // Use the slot machine animation from the external file
                    runSlotMachineAnimation(700, 1500, (finalValue) => {
                        // This callback runs when the user clicks 'Awesome!'
                        sellValue = finalValue;
                        
                        // Show notification after closing the slot machine
                        showNotification(`Secret card sold for ${sellValue} coins!`, 'success', 'secret');
                        
                        // Update game state with the coins
                        gameState.coins += sellValue;
                        updateCoinsDisplay();
                        
                        // Check if set was complete and now isn't
                        const setId = `${category}-${type}`;
                        if (gameState.completedSets.includes(setId)) {
                            const setIndex = gameState.completedSets.indexOf(setId);
                            if (setIndex !== -1) {
                                gameState.completedSets.splice(setIndex, 1);
                            }
                        }
                        
                        // Update UI without closing the modal
                        renderCollection();
                        
                        // Update the card count in the modal
                        const newCardCount = getCardCount(category, type, cardId);
                        const cardCountElement = cardModal.querySelector('.card-count');
                        if (cardCountElement) {
                            // In developer mode, we need to handle the text node differently
                            if (gameState.developerMode) {
                                // Replace the entire content and preserve the button
                                const addCardBtn = cardCountElement.querySelector('#addCardBtn');
                                cardCountElement.innerHTML = `X${newCardCount} `;
                                if (addCardBtn) {
                                    cardCountElement.appendChild(addCardBtn);
                                }
                            } else {
                                // Regular update for non-developer mode
                                cardCountElement.textContent = `X${newCardCount}`;
                            }
                        }
                        
                        // Update the sell button if we now have only 1 card left
                        if (newCardCount <= 1) {
                            const sellButton = document.getElementById('sellFromCollectionBtn');
                            if (sellButton) {
                                sellButton.disabled = true;
                                sellButton.className = 'disabled-btn';
                                sellButton.textContent = "You can't sell your last one";
                            }
                        }
                        
                        // Save game
                        saveGame();
                    });
                    
                    // Return early since we'll handle everything in the callback
                    return;
                } else {
                    // For non-secret cards, process immediately
                    gameState.coins += sellValue;
                    updateCoinsDisplay();
                    
                    // Play sell sound
                    playSound('sell');
                    
                    const setId = `${category}-${type}`;
                    if (gameState.completedSets.includes(setId)) {
                        const setIndex = gameState.completedSets.indexOf(setId);
                        if (setIndex !== -1) {
                            gameState.completedSets.splice(setIndex, 1);
                        }
                    }
                    
                    // Update UI without closing the modal
                    renderCollection();
                    
                    // Update the card count in the modal
                    const newCardCount = getCardCount(category, type, cardId);
                    const cardCountElement = cardModal.querySelector('.card-count');
                    if (cardCountElement) {
                        // In developer mode, we need to handle the text node differently
                        if (gameState.developerMode) {
                            // Replace the entire content and preserve the button
                            const addCardBtn = cardCountElement.querySelector('#addCardBtn');
                            cardCountElement.innerHTML = `X${newCardCount} `;
                            if (addCardBtn) {
                                cardCountElement.appendChild(addCardBtn);
                            }
                        } else {
                            // Regular update for non-developer mode
                            cardCountElement.textContent = `X${newCardCount}`;
                        }
                    }
                    
                    // Update the sell button if we now have only 1 card left
                    if (newCardCount <= 1) {
                        const sellButton = document.getElementById('sellFromCollectionBtn');
                        if (sellButton) {
                            sellButton.disabled = true;
                            sellButton.className = 'disabled-btn';
                            sellButton.textContent = "You can't sell your last one";
                        }
                    }
                    
                    // Show notification with card rarity color
                    // For non-secret cards, we already showed the notification in the random value section
                    if (rarity !== 'secret') {
                        showNotification(`Sold ${capitalizeFirstLetter(type)} (${capitalizeFirstLetter(rarity)}) for ${sellValue} coins!`, 'success', rarity);
                    }
                    
                    // Save game
                    saveGame();
                }
            }
        });
    }
    
    // Add styles if not already in CSS
    if (!document.getElementById('cardDetailStyles')) {
        const style = document.createElement('style');
        style.id = 'cardDetailStyles';
        style.textContent = `
            .card-detail-content {
                display: flex;
                max-width: 700px;
                padding: 0;
                overflow: hidden;
            }
            
            @keyframes modalFadeIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .card-detail-image {
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .card-detail-image img {
                max-width: 100%;
                max-height: 300px;
                object-fit: contain;
                border-radius: 10px;
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
                transform-style: preserve-3d;
                transition: transform 0.3s ease;
            }
            
            .card-detail-image img:hover {
                transform: scale(1.05) rotateY(5deg);
            }
            
            .card-detail-info {
                flex: 1;
                text-align: left;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .card-detail-info h3 {
                font-size: 2rem;
                margin-bottom: 5px;
                color: #f39c12;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            .card-detail-info .rarity {
                font-size: 1.2rem;
                margin-bottom: 10px;
                font-weight: bold;
            }
            
            .card-detail-info .value {
                font-size: 1.5rem;
                margin-bottom: 15px;
                color: #2ecc71;
            }
            
            .card-count {
                margin-bottom: 10px;
                background-color: rgba(0, 0, 0, 0.2);
                padding: 8px 12px;
                border-radius: 5px;
                display: inline-block;
            }
            
            .card-description {
                margin-bottom: 20px;
                line-height: 1.4;
                color: rgba(255, 255, 255, 0.8);
            }
            
            #sellFromCollectionBtn, #closeCardDetailBtn {
                padding: 12px 20px;
                margin-top: 10px;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
                display: block;
                width: 100%;
                max-width: 250px;
                text-align: center;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            #sellFromCollectionBtn {
                background: linear-gradient(135deg, #2ecc71, #27ae60);
                color: white;
                margin: 15px 0;
            }
            
            #sellFromCollectionBtn:hover {
                background: linear-gradient(135deg, #27ae60, #219651);
                transform: translateY(-2px);
                box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
            }
            
            #closeCardDetailBtn {
                background: linear-gradient(135deg, #7f8c8d, #95a5a6);
                color: white;
                margin: 10px 0;
            }
            
            #closeCardDetailBtn:hover {
                background: linear-gradient(135deg, #95a5a6, #7f8c8d);
                transform: translateY(-2px);
                box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
            }
            
            .disabled-btn {
                background: linear-gradient(135deg, #95a5a6, #7f8c8d) !important;
                cursor: not-allowed !important;
                opacity: 0.7;
            }
            
            .close-btn {
                background: linear-gradient(135deg, #7f8c8d, #34495e) !important;
                margin-top: 10px;
            }
            
            .close-btn:hover {
                background: linear-gradient(135deg, #95a5a6, #2c3e50) !important;
            }
            
            .card-container.horizontal {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                max-width: 800px;
                margin-bottom: 20px;
            }
            
            .card-container.horizontal .card {
                flex: 0 0 45%;
                margin-right: 20px;
            }
            
            .card-container.horizontal .card-info {
                flex: 0 0 50%;
                text-align: left;
                padding: 0 20px;
            }
            
            .card-drop-rate {
                margin-top: 10px;
                font-size: 1.1em;
            }
            
            .drop-rate-value {
                font-weight: bold;
            }
            
            /* Ensure drop rate value inherits rarity colors */
            .drop-rate-value.classic { color: #95a5a6; }
            .drop-rate-value.sliver { color: #bdc3c7; }
            .drop-rate-value.gold { color: #f39c12; }
            .drop-rate-value.rare { color: #3498db; }
            .drop-rate-value.supreme { color: #2ecc71; }
            .drop-rate-value.epic { color: #9b59b6; }
            .drop-rate-value.legendary { color: #f1c40f; }
            .drop-rate-value.mythic { color: #e74c3c; }
            .drop-rate-value.secret { color: #1abc9c; }
            
            /* Developer add card button styling */
            .dev-add-card-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                background-color: #2ecc71;
                color: white;
                border: none;
                border-radius: 50%;
                font-size: 16px;
                font-weight: bold;
                margin-left: 10px;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                transition: all 0.2s ease;
            }
            
            .dev-add-card-btn:hover {
                transform: scale(1.1);
                background-color: #27ae60;
            }
            
            .dev-add-card-btn:active {
                transform: scale(0.95);
            }
            
            /* Slot Machine styles are now in slotMachine.js */
            
            @keyframes stamp-animation {
                0% { transform: rotate(15deg) scale(1); }
                50% { transform: rotate(15deg) scale(1.1); }
                100% { transform: rotate(15deg) scale(1); }
            }
            
            .button-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 100%;
                margin-top: 20px;
            }
            
            .button-container button {
                margin: 5px auto;
                display: block;
                min-width: 200px;
            }
        `;
        document.head.appendChild(style);
    }
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Helper function to get the correct card image path with handling for naming inconsistencies
function getCardImagePath(category, type, rarity) {
    // Handle common naming inconsistencies
    let rarityForPath = rarity;
    
    // Fix 'secret' vs 'serect' inconsistency
    if (rarity === 'secret' && (type === 'bass' || type === 'harmonica' || type === 'trombone')) {
        rarityForPath = 'serect';
    }
    
    // Special case for trumpet-secret
    if (type === 'trumpet' && rarity === 'secret') {
        return `Cards/${category}/${type}/trumprt-secret.png`;
    }
    
    // No need to handle sliver vs silver anymore since we've renamed all files
    
    return `Cards/${category}/${type}/${type}-${rarityForPath}.png`;
}

// Initialize the game when DOM is loaded
// Add CSS animation for loot box
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse-animation {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        @keyframes opening-animation {
            0% { transform: scale(1) rotate(0); filter: brightness(1); }
            10% { transform: scale(1.05) rotate(-2deg); filter: brightness(1.1); }
            20% { transform: scale(1.1) rotate(2deg); filter: brightness(1.2); }
            30% { transform: scale(1.15) rotate(-3deg); filter: brightness(1.3); }
            40% { transform: scale(1.2) rotate(3deg); filter: brightness(1.4); }
            50% { transform: scale(1.25) rotate(-4deg); filter: brightness(1.5); }
            60% { transform: scale(1.3) rotate(4deg); filter: brightness(1.6); }
            70% { transform: scale(1.35) rotate(-5deg); filter: brightness(1.7); }
            80% { transform: scale(1.4) rotate(5deg); filter: brightness(1.8); }
            90% { transform: scale(1.45) rotate(-6deg); filter: brightness(1.9); }
            100% { transform: scale(1.5) rotate(0); filter: brightness(2); }
        }
        
        @keyframes box-shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px) rotate(-1deg); }
            20%, 40%, 60%, 80% { transform: translateX(5px) rotate(1deg); }
        }
        
        .pulse-animation {
            animation: pulse-animation 1s ease;
        }
        
        .opening-animation {
            animation: box-shake 0.6s ease-in-out, opening-animation 0.4s ease-in-out 0.6s forwards;
        }
    `;
    document.head.appendChild(style);
}

// Function to initialize UI elements with proper cursor and tooltips
function initializeUIElements() {
    // Game title (h1)
    const gameTitle = document.querySelector('h1');
    if (gameTitle) {
        gameTitle.style.cursor = 'default';
        gameTitle.title = 'Groove Lounge';
    }
    
    // Collection Room title (h2)
    const collectionRoomTitle = document.querySelector('#collectionSection h2');
    if (collectionRoomTitle) {
        collectionRoomTitle.style.cursor = 'default';
        collectionRoomTitle.title = 'Collection Room';
    }
    
    // Set titles (h3)
    const setTitles = document.querySelectorAll('.set-title');
    setTitles.forEach(title => {
        const typeName = title.textContent;
        title.style.cursor = 'default';
        title.title = typeName;
    });
    
    // Empty card slots (div)
    const emptyCards = document.querySelectorAll('.set-card.locked');
    emptyCards.forEach(card => {
        card.style.cursor = 'default';
        // Keep the basic card info in the tooltip if it exists
        if (card.title && card.title.includes(' - Click 5 times')) {
            card.title = card.title.split(' - Click 5 times')[0];
        }
    });
}

// Developer mode key sequence detector
let keySequence = [];
const devCode = 'skysky';

// Add coins for testing when clicking the title (only works in developer mode)
function addTestCoins() {
    const gameTitle = document.querySelector('h1');
    if (gameTitle) {
        // Always set default cursor and tooltip first
        gameTitle.style.cursor = 'default';
        gameTitle.title = 'Groove Lounge';
        
        // Only change to pointer and developer tooltip if in developer mode
        if (gameState.developerMode) {
            gameTitle.style.cursor = 'pointer';
            gameTitle.title = 'Click to add 1000 coins for testing';
        }
        
        gameTitle.addEventListener('click', () => {
            // Only add coins if in developer mode
            if (gameState.developerMode) {
                // Add 1000 coins
                gameState.coins += 1000;
                updateCoinsDisplay();
                saveGame();
                
                // Play coin sound
                playSound('sell');
                
                // Show notification
                showNotification('Developer: Added 1000 coins for testing!', 'success');
                
                // Add sparkle effect to the coins display
                addSparkleEffect(elements.coins.parentElement);
            }
        });
    }
}

function toggleDeveloperMode() {
    gameState.developerMode = !gameState.developerMode;
    const devBanner = document.getElementById('developerBanner');
    
    // Elements that should show developer features
    const gameTitle = document.querySelector('h1');
    const collectionRoomTitle = document.querySelector('#collectionSection h2');
    const setTitles = document.querySelectorAll('.set-title');
    const emptyCards = document.querySelectorAll('.set-card.locked');
    const coinsDisplay = document.getElementById('coins');
    
    if (gameState.developerMode) {
        // Enable developer mode
        devBanner.style.display = 'flex';
        devBanner.querySelector('span').textContent = 'YOU ARE IN DEVELOPER MODE';
        console.log('Developer Mode: ON');
        
        // Show developer tooltips and cursors
        if (gameTitle) {
            gameTitle.style.cursor = 'pointer';
            gameTitle.title = 'Click to add 1000 coins for testing';
        }
        
        if (collectionRoomTitle) {
            collectionRoomTitle.style.cursor = 'pointer';
            collectionRoomTitle.title = 'Click 10 times to reset entire collection';
        }
        
        // Add coin adjustment buttons in developer mode
        if (coinsDisplay) {
            // Remove any border or hover effects from coins display
            coinsDisplay.style.border = 'none';
            coinsDisplay.style.padding = '0';
            coinsDisplay.style.cursor = 'default';
            coinsDisplay.title = '';
            
            // Create button container (positioned absolutely)
            const buttonContainer = document.createElement('div');
            buttonContainer.id = 'devButtonContainer';
            buttonContainer.style.position = 'absolute';
            buttonContainer.style.right = '-60px'; // Increased space to prevent cutoff
            buttonContainer.style.top = '0';
            buttonContainer.style.display = 'flex';
            buttonContainer.style.flexDirection = 'column';
            buttonContainer.style.gap = '5px';
            buttonContainer.style.zIndex = '100';
            
            // Create +1000 button
            const addButton = document.createElement('button');
            addButton.textContent = '+1000';
            addButton.id = 'addCoinsButton';
            addButton.className = 'dev-coin-button';
            addButton.style.backgroundColor = '#2ecc71';
            addButton.style.color = 'white';
            addButton.style.border = 'none';
            addButton.style.borderRadius = '4px';
            addButton.style.padding = '3px 8px';
            addButton.style.fontSize = '12px';
            addButton.style.cursor = 'pointer';
            addButton.style.fontWeight = 'bold';
            addButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            
            // Create -1000 button
            const subtractButton = document.createElement('button');
            subtractButton.textContent = '-1000';
            subtractButton.id = 'subtractCoinsButton';
            subtractButton.className = 'dev-coin-button';
            subtractButton.style.backgroundColor = '#e74c3c';
            subtractButton.style.color = 'white';
            subtractButton.style.border = 'none';
            subtractButton.style.borderRadius = '4px';
            subtractButton.style.padding = '3px 8px';
            subtractButton.style.fontSize = '12px';
            subtractButton.style.cursor = 'pointer';
            subtractButton.style.fontWeight = 'bold';
            subtractButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            
            // Add buttons to container
            buttonContainer.appendChild(addButton);
            buttonContainer.appendChild(subtractButton);
            
            // Get the currency display container (parent of coins display)
            const currencyDisplay = coinsDisplay.parentNode;
            currencyDisplay.style.position = 'relative'; // Make it positioned for absolute positioning of buttons
            
            // Add button container to the currency display
            currencyDisplay.appendChild(buttonContainer);
            
            // Store references for later cleanup
            gameState.devButtonContainer = buttonContainer;
            
            // Add event listeners with direct DOM methods (more reliable)
            document.getElementById('addCoinsButton').addEventListener('click', function() {
                gameState.coins += 1000;
                updateCoinsDisplay();
                saveGame();
                showNotification('Developer: Added 1000 coins', 'success');
                playSound('sell');
            });
            
            document.getElementById('subtractCoinsButton').addEventListener('click', function() {
                if (gameState.coins >= 1000) {
                    gameState.coins -= 1000;
                    updateCoinsDisplay();
                    saveGame();
                    showNotification('Developer: Removed 1000 coins', 'info');
                } else {
                    gameState.coins = 0;
                    updateCoinsDisplay();
                    saveGame();
                    showNotification('Developer: Coins set to 0', 'error');
                }
            });
        }
        
        // Set titles (h3)
        setTitles.forEach(title => {
            const typeName = title.textContent;
            title.style.cursor = 'pointer';
            title.title = `${typeName} - Click 5 times to reset this set`;
        });
        
        // Empty card slots (div)
        emptyCards.forEach(card => {
            const cardTitle = card.title;
            card.style.cursor = 'pointer';
            if (cardTitle) {
                card.title = `${cardTitle} - Click 5 times to add this card`;
            }
        });
    } else {
        // Disable developer mode
        devBanner.style.display = 'none';
        console.log('Developer Mode: OFF');
        
        // Hide developer tooltips and cursors
        if (gameTitle) {
            gameTitle.style.cursor = 'default';
            gameTitle.title = 'Groove Lounge';
        }
        
        if (collectionRoomTitle) {
            collectionRoomTitle.style.cursor = 'default';
            collectionRoomTitle.title = 'Collection Room';
        }
        
        // Reset coins display and remove the coin buttons
        if (gameState.devButtonContainer) {
            // Remove the button container if it exists
            if (gameState.devButtonContainer.parentNode) {
                gameState.devButtonContainer.parentNode.removeChild(gameState.devButtonContainer);
            }
            // Reset the reference
            gameState.devButtonContainer = null;
        }
        
        // Reset coins display properties
        if (coinsDisplay) {
            coinsDisplay.style.cursor = 'default';
            coinsDisplay.title = '';
            coinsDisplay.style.border = 'none';
            coinsDisplay.style.padding = '0';
        }
        
        // Set titles (h3)
        setTitles.forEach(title => {
            const typeName = title.textContent;
            title.style.cursor = 'default';
            title.title = typeName;
        });
        
        // Empty card slots (div)
        emptyCards.forEach(card => {
            const cardTitle = card.title;
            card.style.cursor = 'default';
            if (cardTitle && cardTitle.includes(' - Click 5 times')) {
                card.title = cardTitle.split(' - Click 5 times')[0];
            }
        });
    }
    
    // Reset key sequence
    keySequence = [];
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all UI elements
    initializeUIElements();
    
    addAnimationStyles();
    
    // Add developer function to reset entire collection when clicking Collection Room title 10 times (hidden from tooltip)
    const collectionRoomTitle = document.querySelector('#collectionSection h2');
    if (collectionRoomTitle) {
        collectionRoomTitle.style.cursor = 'default';
        collectionRoomTitle.dataset.clickCount = '0';
        collectionRoomTitle.title = 'Collection Room';
        
        collectionRoomTitle.addEventListener('click', () => {
            let clickCount = parseInt(collectionRoomTitle.dataset.clickCount) || 0;
            clickCount++;
            collectionRoomTitle.dataset.clickCount = clickCount;
            
            // Keep the tooltip simple without revealing the developer feature
            collectionRoomTitle.title = 'Collection Room';
            
            if (clickCount >= 10 && gameState.developerMode) {
                // Only reset collection if in developer mode
                const totalCards = Object.keys(gameState.collection).reduce((count, category) => {
                    return count + Object.keys(gameState.collection[category]).reduce((typeCount, type) => {
                        return typeCount + (gameState.collection[category][type] ? gameState.collection[category][type].length : 0);
                    }, 0);
                }, 0);
                
                // Reset collection and completed sets
                gameState.collection = {
                    character: {},
                    weapon: {},
                    instrument: {}
                };
                gameState.completedSets = [];
                
                // Show notification
                showNotification(`Developer: Reset entire collection (${totalCards} cards removed)!`, 'error');
                
                // Update collection display
                renderCollection();
                updateCollectionStats();
                
                // Save game
                saveGame();
                
                // Reset click count
                collectionRoomTitle.dataset.clickCount = '0';
            } else if (clickCount >= 10) {
                // If not in developer mode, show a message that developer mode is required
                showNotification('This feature requires Developer Mode', 'info');
                collectionRoomTitle.dataset.clickCount = '0';
            }
        });
    }
    
    // Make sure all DOM elements are properly initialized
    elements.openBoxBtn = document.getElementById('openBoxBtn');
    elements.claimCardBtn = document.getElementById('claimCardBtn');
    
    // Debug log to check if buttons exist
    console.log('Open Box Button:', elements.openBoxBtn);
    console.log('Claim Card Button:', elements.claimCardBtn);
    
    // Add click events to all loot box types
    const lootBoxes = document.querySelectorAll('.loot-box');
    if (lootBoxes.length > 0) {
        console.log(`Found ${lootBoxes.length} loot boxes`);
        lootBoxes.forEach(box => {
            const boxType = box.dataset.boxType;
            if (boxType) {
                console.log(`Adding click event to ${boxType} Box`);
                
                // Add a single click event listener
                box.onclick = function() {
                    // Prevent multiple clicks if a card is currently being displayed
                    if (gameState.currentCard) {
                        console.log('Card already being displayed, ignoring click');
                        return;
                    }
                    
                    // Prevent clicking if we don't have enough coins
                    const boxCost = parseInt(box.dataset.boxCost);
                    if (gameState.coins < boxCost) {
                        showNotification(`Not enough coins! You need ${boxCost} coins.`, 'error');
                        return;
                    }
                    
                    console.log(`${boxType} Box clicked`);
                    openBox(boxType);
                };
            }
        });
    } else {
        console.error('No loot boxes found in the DOM');
    }
    
    // Direct event listener for Claim button
    if (elements.claimCardBtn) {
        console.log('Adding click event to claim button');
        elements.claimCardBtn.onclick = function() {
            // Remove NEW! stamp if it exists
            const newStamp = document.querySelector('.new-stamp');
            if (newStamp) {
                newStamp.remove();
            }
            console.log('Claim button clicked');
            
            // Play claim sound directly on button click
            const audio = new Audio('SoundEffects/Claim.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.log('Audio play failed:', e));
            
            claimCard();
        };
    } else {
        console.error('Claim button not found in the DOM');
    }
    
    // Add click event to the title for adding test coins
    addTestCoins();
    
    // Setup key sequence detection for developer mode
    document.addEventListener('keydown', (event) => {
        // Only track alphabetic keys
        if (/^[a-z]$/i.test(event.key)) {
            keySequence.push(event.key.toLowerCase());
            
            // Keep only the last 6 characters (length of 'skysky')
            if (keySequence.length > devCode.length) {
                keySequence.shift();
            }
            
            // Check if the sequence matches the dev code
            const currentSequence = keySequence.join('');
            if (currentSequence === devCode) {
                toggleDeveloperMode();
            }
        }
    });
    
    // Setup exit developer mode button
    const exitDevModeBtn = document.getElementById('exitDevMode');
    if (exitDevModeBtn) {
        exitDevModeBtn.addEventListener('click', () => {
            if (gameState.developerMode) {
                toggleDeveloperMode();
            }
        });
    }
    
    const gameTitle = document.querySelector('h1');
    if (gameTitle) {
        gameTitle.style.cursor = 'pointer';
        gameTitle.title = 'Click to add 1000 coins for testing';
        gameTitle.addEventListener('click', addTestCoins);
    }
    
    // Initialize the rest of the game
    initGame();
});
