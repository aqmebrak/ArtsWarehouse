import { Scene } from 'phaser';

export class Boot extends Scene {
	constructor() {
		super('Boot');
	}

	preload() {
		//  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
		//  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
		// Load character sprite
		this.load.spritesheet('player', 'player.png',{
			frameWidth: 48,
			frameHeight: 48,

		});
		// Load background and tree assets
		this.load.image('grass', 'grass.png');
		this.load.image('tree', 'tree.png');

		// Load rocks spritesheet - adjust frameWidth and frameHeight to match your spritesheet
		this.load.spritesheet('rocks', 'Rocks.png', {
			frameWidth: 16,  // Adjust to match your rock sprite width
			frameHeight: 16  // Adjust to match your rock sprite height
		},
			);
	}

	create() {
		this.scene.start('Preloader');
	}
}