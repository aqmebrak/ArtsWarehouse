import { Scene } from 'phaser';

export class Preloader extends Scene {
	constructor() {
		super('Preloader');
	}

	init() {
		const width = this.cameras.main.width;
		const height = this.cameras.main.height;
		const barWidth = this.cameras.main.width / 2;
		const barHeight = 32;

		// The outline of the bar
		this.add.rectangle(width / 2, height / 2, barWidth, barHeight)
			.setStrokeStyle(1, 0xffffff);

		// Calculate the left edge position of the background bar
		const barLeft = width / 2 - barWidth / 2;

		// Progress bar with origin set to left center (grows from left to right)
		const bar = this.add.rectangle(barLeft + 4, height / 2, 0, 28, 0xffffff)
			.setOrigin(0, 0.5);  // 0 on x-axis means left alignment

		// Update the progress bar width from left to right
		this.load.on('progress', (progress: number) => {
			// Calculate width based on progress (max width: 460)
			bar.width = barWidth * progress;
		});
	}

	preload() {
		// Load rocks spritesheet - adjust frameWidth and frameHeight to match your spritesheet
		this.load.spritesheet('rocks', 'Rocks.png', {
			frameWidth: 16,  // Adjust to match your rock sprite width
			frameHeight: 16  // Adjust to match your rock sprite height
		});

		// Load game assets
		this.load.image('grass', 'grass.png');
		this.load.image('tree', 'oak_tree.png');
		this.load.image('barrel', 'barrel.png');
		this.load.image('blue_tile', 'blue_tile.png');
		this.load.image('kunai', 'kunai.png');

		// Load enemy assets
		this.load.spritesheet('slime', 'slime.png', {
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

		// Load chicken spritesheet
		this.load.spritesheet('chicken', 'Chicken.png', {
			frameWidth: 32,
			frameHeight: 32
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
		this.scene.start('Game');
	}
}