import { Scene } from 'phaser';

export class Boot extends Scene {
	constructor() {
		super('Boot');
	}

	preload() {
		//  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
		//  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

		// Load background and tree assets
		this.load.image('grass', 'grass.png');
		this.load.image('tree', 'tree.png');

		// Load rocks spritesheet - adjust frameWidth and frameHeight to match your spritesheet
		this.load.spritesheet('rocks', 'Rocks.png', {
			frameWidth: 16,  // Adjust to match your rock sprite width
			frameHeight: 16  // Adjust to match your rock sprite height
		});

		// Load game assets
		this.load.image('grass', 'grass.png');
		this.load.image('tree', 'tree.png');
		this.load.spritesheet('rocks', 'Rocks.png', {
			frameWidth: 32,
			frameHeight: 32
		});

		// Load basecamp assets
		this.load.spritesheet('wall', 'walls.png', {
			frameWidth: 48,  // Width of the largest element in the spritesheet
			frameHeight: 16,  // Height of the wall elements
			margin: 16,
		});
		this.load.spritesheet('wall-vertical', 'walls.png', {
			frameWidth: 16,  // Width of the largest element in the spritesheet
			frameHeight: 48  // Height of the wall elements
		});
		this.load.spritesheet('door', 'wooden_door.png', {
			frameWidth: 16,
			frameHeight: 16
		});

		// Load player spritesheet
		// With 6 frames per row:
		// - Row 1 (frames 0-5): Idle animation
		// - Row 2 (frames 6-11): Moving right/left animation
		// - Row 3 (frames 12-17): Moving up animation
		// - Row 4 (frames 18-23): Moving down animation
		// - Row 5 (frames 24-29): Similar to row 2
		// - Row 6 (frames 30-35): Similar to row 3
		// - Row 7 (frames 36-41): Bottom attack animation
		// - Row 8 (frames 42-47): Right attack animation
		// - Row 9 (frames 48-53): Top attack animation
		this.load.spritesheet('player', 'player.png', {
			frameWidth: 48,
			frameHeight: 48,
		});
	}

	create() {
		this.scene.start('Preloader');
	}
}