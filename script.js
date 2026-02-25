/**
 * Dice Roller Pro - Logic
 * A simple, responsive dice roller using vanilla JavaScript.
 */

// Configuration
const COLORS = [
  { name: 'Red', class: 'bg-red-500', text: 'text-white' },
  { name: 'Blue', class: 'bg-blue-500', text: 'text-white' },
  { name: 'Green', class: 'bg-green-500', text: 'text-white' },
  { name: 'Yellow', class: 'bg-yellow-400', text: 'text-black' },
  { name: 'Purple', class: 'bg-purple-500', text: 'text-white' },
  { name: 'Orange', class: 'bg-orange-500', text: 'text-white' },
  { name: 'Pink', class: 'bg-pink-500', text: 'text-white' },
  { name: 'Teal', class: 'bg-teal-500', text: 'text-white' },
  { name: 'Indigo', class: 'bg-indigo-600', text: 'text-white' },
  { name: 'Gray', class: 'bg-gray-600', text: 'text-white' }
];

// State
let diceCount = 1;
let selectedColors = [0]; // Indices of COLORS
let diceState = [
  { value: 1, excluded: false, colorIndex: 0 }
];

// DOM Elements (will be initialized in init)
let diceContainer;
let diceCountInput;
let colorOptionsContainer;
let rollButton;

/**
 * Initialize the application
 */
function init() {
  // Initialize DOM elements
  diceContainer = document.getElementById('dice-container');
  diceCountInput = document.getElementById('dice-count');
  colorOptionsContainer = document.getElementById('color-options');
  rollButton = document.getElementById('roll-button');

  // Initial render
  renderColorOptions();
  renderDice();
  
  // Event Listeners
  diceCountInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 1 && val <= 10) {
      updateDiceCount(val);
    }
  });

  // Ensure value is valid on blur
  diceCountInput.addEventListener('blur', (e) => {
    const val = parseInt(e.target.value);
    if (isNaN(val) || val < 1) {
      updateDiceCount(1);
      diceCountInput.value = 1;
    } else if (val > 10) {
      updateDiceCount(10);
      diceCountInput.value = 10;
    }
  });

  rollButton.addEventListener('click', rollAll);
}

/**
 * Render the color selection buttons
 */
function renderColorOptions() {
  colorOptionsContainer.innerHTML = '';
  COLORS.forEach((color, index) => {
    const button = document.createElement('button');
    button.className = `w-8 h-8 rounded-full border-2 transition-all ${color.class} ${selectedColors.includes(index) ? 'border-black scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`;
    button.title = color.name;
    button.onclick = () => toggleColor(index);
    colorOptionsContainer.appendChild(button);
  });
}

/**
 * Toggle a color in the selection
 */
function toggleColor(index) {
  if (selectedColors.includes(index)) {
    // Don't allow deselecting the last color
    if (selectedColors.length > 1) {
      selectedColors = selectedColors.filter(i => i !== index);
    }
  } else {
    selectedColors.push(index);
  }
  
  renderColorOptions();
  
  diceState.forEach((die, i) => {
    die.colorIndex = selectedColors[i % selectedColors.length];
  });
  renderDice();
}

/**
 * Update the number of dice
 */
function updateDiceCount(newCount) {
  if (newCount > diceCount) {
    // Add dice
    for (let i = diceCount; i < newCount; i++) {
      diceState.push({
        value: 1,
        excluded: false,
        colorIndex: selectedColors[i % selectedColors.length]
      });
    }
  } else if (newCount < diceCount) {
    // Remove dice
    diceState = diceState.slice(0, newCount);
  }
  
  diceCount = newCount;
  renderDice();
}

/**
 * Roll all active dice
 */
function rollAll() {
  // Add animation class
  const diceElements = document.querySelectorAll('.die:not(.excluded)');
  diceElements.forEach(el => {
    el.classList.remove('animate-roll');
    // Trigger reflow to restart animation
    void el.offsetWidth;
    el.classList.add('animate-roll');
  });
  
  setTimeout(() => {
    diceState.forEach(die => {
      if (!die.excluded) {
        die.value = Math.floor(Math.random() * 6) + 1;
      }
    });
    renderDice();
  }, 300);
}

/**
 * Toggle exclusion for a specific die
 */
function toggleExclusion(index) {
  diceState[index].excluded = !diceState[index].excluded;
  renderDice();
}

/**
 * Render the dice grid
 */
function renderDice() {
  diceContainer.innerHTML = '';
  diceState.forEach((die, index) => {
    const color = COLORS[die.colorIndex];
    const dieElement = document.createElement('div');
    dieElement.className = `die relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center rounded-2xl shadow-xl cursor-pointer transition-all transform hover:scale-105 ${die.excluded ? 'opacity-40 grayscale scale-95 border-4 border-dashed border-gray-400' : color.class + ' ' + color.text} ${die.excluded ? 'excluded' : ''}`;
    
    // Dice dots container
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'grid grid-cols-3 grid-rows-3 gap-2 w-16 h-16 sm:w-20 sm:h-20 p-2';
    
    // Dot positions for each value
    const dotPositions = {
      1: [4],
      2: [2, 6],
      3: [2, 4, 6],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8]
    };

    const activeDots = dotPositions[die.value];
    for (let i = 0; i < 9; i++) {
      const dot = document.createElement('div');
      dot.className = `w-full h-full rounded-full ${activeDots.includes(i) ? (die.excluded ? 'bg-gray-400' : 'bg-current') : 'bg-transparent'}`;
      dotsContainer.appendChild(dot);
    }

    dieElement.appendChild(dotsContainer);
    
    if (die.excluded) {
      const label = document.createElement('div');
      label.className = 'absolute inset-0 flex items-center justify-center';
      label.innerHTML = '<span class="bg-white/80 text-black px-2 py-1 rounded text-xs font-bold uppercase tracking-wider shadow-sm">Excluded</span>';
      dieElement.appendChild(label);
    }
    
    dieElement.onclick = () => toggleExclusion(index);
    diceContainer.appendChild(dieElement);
  });
}

// Start the app when DOM is fully loaded
document.addEventListener("DOMContentLoaded", init);
