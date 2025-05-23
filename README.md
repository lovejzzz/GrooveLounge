# Groove Lounge - Loot Box Collection Game

A web-based card collection game where you open loot boxes to collect character, weapon, and instrument cards of different rarities. Experience the thrill of opening boxes and building your collection!

## How to Play

1. **Start with 2000 Coins**: Begin your collection journey with 2000 coins to open various loot boxes.
2. **Open Loot Boxes**: Choose from different box types with varying costs and rarity distributions.
3. **Collect Cards**: Add cards to your collection or sell them for coins.
4. **Complete Sets**: A set is complete when you collect all 9 different rarities of a card type.
5. **Earn Rewards**: Get a 500 coin bonus when you complete a set!

## Card Categories and Types

### Characters
- Bird
- Boat
- Cat
- Elephant
- Monk
- Rat
- Robot

### Weapons
- Crossbow
- Dagger
- Pistol
- Polearm
- Spear
- Sword

### Instruments
- Drums
- Guitar
- Piano
- Saxophone
- Trumpet
- Violin

## Card Rarities

Each card type has 9 different rarities with varying drop rates and values:

| Rarity    | Sale Value | Drop Rate (%) | Description           |
|-----------|------------|---------------|-----------------------|
| Classic   | 5 Coins    | 55.0%         | Common, high drop rate|
| Silver    | 10 Coins   | 20.0%         | Slightly rarer        |
| Gold      | 20 Coins   | 10.0%         | Noticeable rarity     |
| Rare      | 50 Coins   | 6.0%          | Strong cards          |
| Supreme   | 100 Coins  | 3.5%          | High-impact           |
| Epic      | 150 Coins  | 2.5%          | Very rare             |
| Legendary | 250 Coins  | 1.8%          | Game-changing         |
| Mythic    | 500 Coins  | 0.9%          | Ultra-rare            |
| Secret    | 1000 Coins | 0.3%          | Rarest of all         |

## Loot Box Types

### Conqueror Box (100 Coins)
The standard box with a balanced distribution of all rarities.

### Maestro Box (200 Coins)
A premium box with improved odds for higher rarities:
- No Classic cards (0%)
- Increased chance for Silver (35%) and Gold (25%)
- Better odds for rare cards

### Virtuoso Box (300 Coins)
The premium box with the best odds for high-rarity cards:
- No Classic or Silver cards
- Significantly higher chances for Epic, Legendary, Mythic, and Secret rarities

## Developer Mode

The game includes a special developer mode for testing and debugging purposes.

### How to Activate
1. Type "skysky" on your keyboard while in the game
2. A banner will appear at the top of the screen indicating "YOU ARE IN DEVELOPER MODE"

### Developer Features

#### Coin Management
- Two buttons appear next to your coin display: "+1000" and "-1000"
- Click these buttons to quickly add or remove coins for testing

#### Collection Management
- **Game Title**: Click the "Groove Lounge" title to add 1000 coins instantly
- **Collection Room Title**: Click 10 times to reset your entire collection
- **Set Titles**: Click 5 times on any set title to reset just that set
- **Empty Card Slots**: Click 5 times on an empty slot to add that specific card

#### Exit Developer Mode
- Click the "EXIT DEVELOPER MODE" button at the top of the screen

## Game Features

- Beautiful card collection interface with 3D effects
- Dynamic animations and sound effects
- Set completion tracking and rewards
- Local storage save system
- Responsive design for different screen sizes
- Special effects for rare card reveals

## How to Run

Simply open the `index.html` file in your web browser to start playing!

## Technical Details

- Built with vanilla JavaScript, HTML5, and CSS3
- No external libraries or frameworks required
- Uses local storage for game state persistence
- All assets included in the repository
