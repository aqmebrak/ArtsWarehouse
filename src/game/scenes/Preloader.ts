import { Scene } from 'phaser';

export class Preloader extends Scene {
	constructor() {
		super('Preloader');
	}

	init() {
		const width = this.cameras.main.width;
		const height = this.cameras.main.height;

		//  A simple progress bar. This is the outline of the bar.
		this.add.rectangle(width / 2, height / 2, 468, 32).setStrokeStyle(1, 0xffffff);

		//  This is the progress bar itself. It will increase in size from the left based on the % of progress.
		const bar = this.add.rectangle((width / 2) - 230, height / 2, 4, 28, 0xffffff);

		//  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
		this.load.on('progress', (progress: number) => {

			//  Update the progress bar (our bar is 464px wide, so 100% = 464px)
			bar.width = 4 + (460 * progress);

		});
	}

	preload() {
		// Load joystick plugin
		this.load.plugin('rexvirtualjoystickplugin',
			'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js',
			true
		);

		// Load game assets
		this.load.image('grass', 'grass.png');
		this.load.image('tree', 'tree.png');
		this.load.spritesheet('rocks', 'Rocks.png', {
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
			frameWidth: 48,  // Correct size based on image dimensions (288px ÷ 6 frames = 48px)
			frameHeight: 53  // Correct size based on image dimensions (480px ÷ 9 rows ≈ 53px)
		});
	}

	create() {
		this.scene.start('Game');
	}
}