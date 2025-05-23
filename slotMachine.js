/**
 * Slot Machine Animation for Secret Cards
 * This file contains the functionality for the slot machine animation
 * when selling secret cards in the Groove Lounge game.
 */

// Create and initialize the slot machine modal
function createSlotMachineModal() {
    // Create slot machine modal if it doesn't exist
    let slotMachineModal = document.querySelector('.slot-machine-modal');
    
    if (!slotMachineModal) {
        slotMachineModal = document.createElement('div');
        slotMachineModal.className = 'modal slot-machine-modal';
        slotMachineModal.style.display = 'none';
        slotMachineModal.style.zIndex = '2000'; // Ensure it's above other modals that use z-index: 1000
        slotMachineModal.innerHTML = `
            <div class="modal-content slot-machine-content">
                <div class="slot-machine-container">
                    <div class="final-value-container">
                        <h3>Your secret card is worth:</h3>
                        <div class="value-display">
                            <div class="flip-board">
                                <div class="flip-digit thousands">
                                    <div class="top">0</div>
                                    <div class="bottom">0</div>
                                    <div class="flip-top">0</div>
                                    <div class="flip-bottom">0</div>
                                </div>
                                <div class="flip-digit hundreds">
                                    <div class="top">0</div>
                                    <div class="bottom">0</div>
                                    <div class="flip-top">0</div>
                                    <div class="flip-bottom">0</div>
                                </div>
                                <div class="flip-digit tens">
                                    <div class="top">0</div>
                                    <div class="bottom">0</div>
                                    <div class="flip-top">0</div>
                                    <div class="flip-bottom">0</div>
                                </div>
                                <div class="flip-digit ones">
                                    <div class="top">0</div>
                                    <div class="bottom">0</div>
                                    <div class="flip-top">0</div>
                                    <div class="flip-bottom">0</div>
                                </div>
                            </div>
                            <span class="coins-label">Coins</span>
                        </div>
                    </div>
                </div>
                <button id="slotMachineCloseBtn" class="claim-btn">Awesome!</button>
            </div>
        `;
        document.body.appendChild(slotMachineModal);
    }
    
    return slotMachineModal;
}

/**
 * Run the slot machine animation for a secret card sale
 * @param {number} minValue - Minimum possible value (default: 700)
 * @param {number} maxValue - Maximum possible value (default: 1500)
 * @param {Function} onComplete - Callback function to run when animation completes and user clicks "Awesome!"
 */
// Make this function global so it can be called from app.js
window.runSlotMachineAnimation = function(minValue = 700, maxValue = 1500, onComplete) {
    // Create or get the slot machine modal
    const slotMachineModal = createSlotMachineModal();
    
    // Generate random value between min and max
    const sellValue = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
    const sellValueStr = sellValue.toString().padStart(4, '0');
    
    // Get the flip digits
    const thousandsDigit = slotMachineModal.querySelector('.flip-digit.thousands');
    const hundredsDigit = slotMachineModal.querySelector('.flip-digit.hundreds');
    const tensDigit = slotMachineModal.querySelector('.flip-digit.tens');
    const onesDigit = slotMachineModal.querySelector('.flip-digit.ones');
    
    // Show the modal
    slotMachineModal.style.display = 'flex';
    slotMachineModal.style.justifyContent = 'center';
    slotMachineModal.style.alignItems = 'center';
    slotMachineModal.style.zIndex = '2000'; // Ensure it's above other modals that use z-index: 1000
    
    // Play slot machine sound
    if (typeof playSound === 'function') {
        playSound('slotMachine');
    }
    
    // Function to rapidly flip through random numbers
    const rapidFlip = (digitElement, finalValue, duration, stopDelay) => {
        // Get the top and bottom elements
        const top = digitElement.querySelector('.top');
        const bottom = digitElement.querySelector('.bottom');
        const flipTop = digitElement.querySelector('.flip-top');
        const flipBottom = digitElement.querySelector('.flip-bottom');
        
        // Start with random values
        let currentValue = Math.floor(Math.random() * 10);
        top.textContent = currentValue;
        bottom.textContent = currentValue;
        
        // Clear any existing animations
        if (digitElement.flipInterval) {
            clearInterval(digitElement.flipInterval);
        }
        
        // Start rapid flipping
        let isTopFlip = true;
        digitElement.flipInterval = setInterval(() => {
            // Generate a new random number
            currentValue = Math.floor(Math.random() * 10);
            
            if (isTopFlip) {
                // Flip the top half
                flipTop.textContent = currentValue;
                flipTop.style.animation = 'flipTop 0.05s linear forwards';
                setTimeout(() => {
                    top.textContent = currentValue;
                    flipTop.style.animation = 'none';
                }, 50);
            } else {
                // Flip the bottom half
                flipBottom.textContent = currentValue;
                flipBottom.style.animation = 'flipBottom 0.05s linear forwards';
                setTimeout(() => {
                    bottom.textContent = currentValue;
                    flipBottom.style.animation = 'none';
                }, 50);
            }
            
            // Alternate between top and bottom flips
            isTopFlip = !isTopFlip;
        }, 100); // Flip every 100ms for a rapid effect
        
        // Stop the flipping after the specified duration and show the final value
        setTimeout(() => {
            clearInterval(digitElement.flipInterval);
            
            // Set final value with one last flip
            setTimeout(() => {
                // Final top flip
                flipTop.textContent = finalValue;
                flipTop.style.animation = 'flipTop 0.15s ease-out forwards';
                
                setTimeout(() => {
                    top.textContent = finalValue;
                    bottom.textContent = finalValue;
                    flipBottom.textContent = finalValue;
                    
                    // Final bottom flip
                    flipBottom.style.animation = 'flipBottom 0.15s ease-out forwards';
                }, 150);
            }, 100);
        }, duration);
    };
    
    // Start rapid flipping for each digit with different durations
    rapidFlip(thousandsDigit, parseInt(sellValueStr[0]), 800, 0);
    rapidFlip(hundredsDigit, parseInt(sellValueStr[1]), 1000, 0);
    rapidFlip(tensDigit, parseInt(sellValueStr[2]), 1200, 0);
    rapidFlip(onesDigit, parseInt(sellValueStr[3]), 1400, 0);
    
    // After all animations complete, show the Awesome button
    setTimeout(() => {
        
        // Add event listener to close button
        const closeBtn = document.getElementById('slotMachineCloseBtn');
        
        // Remove any existing event listeners to prevent duplicates
        const newBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newBtn, closeBtn);
        
        newBtn.addEventListener('click', () => {
            // Play selling sound when clicking Awesome!
            if (typeof playSound === 'function') {
                playSound('sell');
            }
            
            slotMachineModal.style.display = 'none';
            
            // Call the completion callback with the final value
            if (typeof onComplete === 'function') {
                onComplete(sellValue);
            }
        });
    }, 1700); // After all digits have stopped flipping
    
    return sellValue;
}

// Add the CSS styles for the slot machine
function addSlotMachineStyles() {
    // Check if styles already exist
    if (document.getElementById('slot-machine-styles')) {
        return;
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = 'slot-machine-styles';
    styleElement.textContent = `
        /* Slot Machine Modal Styling */
        .slot-machine-modal {
            display: none; /* Will be set to flex when shown */
            position: fixed;
            z-index: 2000 !important; /* Ensure it's above all other elements */
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            animation: fadeIn 0.3s ease-in-out;
        }
        .slot-machine-content {
            background: linear-gradient(135deg, #2c3e50, #34495e);
            border: 3px solid #f1c40f;
            border-radius: 15px;
            max-width: 500px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            color: white;
        }
        
        .slot-machine-content h2 {
            color: #f1c40f;
            font-size: 28px;
            margin-bottom: 20px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .slot-machine-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 20px 0;
        }
        
        /* Flip Board Styling */
        .flip-board {
            display: flex;
            gap: 4px;
            margin-right: 10px;
        }
        
        .flip-digit {
            position: relative;
            width: 50px;
            height: 70px;
            perspective: 300px;
            background: transparent;
            color: #f1c40f;
        }
        
        .top, .bottom, .flip-top, .flip-bottom {
            position: absolute;
            width: 100%;
            height: 50%;
            overflow: hidden;
            background: #1a1a1a;
            font-size: 44px;
            font-weight: bold;
            font-family: 'Arial', sans-serif;
            text-align: center;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            border: 1px solid #333;
            color: #f1c40f;
        }
        
        .top, .flip-top {
            top: 0;
            border-radius: 5px 5px 0 0;
            line-height: 70px;
            border-bottom: 1px solid #333;
            background: linear-gradient(to bottom, #2c3e50, #1a1a1a);
        }
        
        .bottom, .flip-bottom {
            bottom: 0;
            border-radius: 0 0 5px 5px;
            line-height: 0;
            border-top: 1px solid #333;
            background: linear-gradient(to top, #2c3e50, #1a1a1a);
        }
        
        .flip-top, .flip-bottom {
            z-index: 10;
            transform-origin: bottom;
            backface-visibility: hidden;
        }
        
        .flip-top {
            transform-origin: bottom;
            animation: flipTop 0.05s linear;
            animation-fill-mode: forwards;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
        }
        
        .flip-bottom {
            transform-origin: top;
            animation: flipBottom 0.05s linear;
            animation-fill-mode: forwards;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
        }
        
        @keyframes flipTop {
            0% { transform: rotateX(0deg); }
            100% { transform: rotateX(-90deg); }
        }
        
        @keyframes flipBottom {
            0% { transform: rotateX(90deg); }
            100% { transform: rotateX(0deg); }
        }
        
        .final-value-container {
            margin-top: 20px;
            background: rgba(26, 26, 26, 0.7);
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .final-value-container h3 {
            color: #f1c40f;
            margin-bottom: 10px;
            font-size: 18px;
        }
        
        .value-display {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin: 15px 0;
        }
        
        .final-value {
            font-size: 42px;
            font-weight: bold;
            color: #2ecc71;
            text-shadow: 0 0 10px rgba(46, 204, 113, 0.5);
        }
        
        .coins-label {
            color: #f1c40f;
            font-size: 22px;
            font-weight: bold;
        }
        
        #slotMachineCloseBtn {
            background-color: #f1c40f;
            color: #2c3e50;
            font-size: 18px;
            font-weight: bold;
            padding: 12px 30px;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 20px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        #slotMachineCloseBtn:hover {
            background-color: #f39c12;
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }
        
        #slotMachineCloseBtn:active {
            transform: translateY(1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Initialize the slot machine when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    addSlotMachineStyles();
});
