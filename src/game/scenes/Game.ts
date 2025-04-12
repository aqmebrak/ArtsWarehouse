import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Player } from '../Entities/Player';
import { Tree } from '../Entities/Tree';
import { Rock } from '../Entities/Rock';
import { Basecamp } from '../Entities/Basecamp';

export class Game extends Scene {
	// Game variables
	private playerEntity: Player | undefined;
	joystick: any;
	cursorKeys: any;

	// Entity collections
	private treeEntities: Tree[] = [];
	private rockEntities: Rock[] = [];
	private basecamp: Basecamp | undefined;

	// Physics groups for collision detection - these need to be public so entities can access them
	trees: Phaser.Physics.Arcade.StaticGroup;
	rocks: Phaser.Physics.Arcade.StaticGroup;
	walls: Phaser.Physics.Arcade.StaticGroup;
	doors: Phaser.Physics.Arcade.StaticGroup;

	constructor() {
		super('Game');
	}

	create() {
		const width = this.cameras.main.width;
		const height = this.cameras.main.height;

		// Add grass background with tiling
		const backgroundImage = this.add.tileSprite(0, 0, width * 2, height * 2, 'grass');
		backgroundImage.setOrigin(0, 0);
		backgroundImage.setPosition(0, 0);

		// Create physics groups
		this.trees = this.physics.add.staticGroup();
		this.rocks = this.physics.add.staticGroup();
		this.walls = this.physics.add.staticGroup();
		this.doors = this.physics.add.staticGroup();

		// Set world center
		const centerX = width / 2;
		const centerY = height / 2;

		// Create basecamp and store it
		this.basecamp = new Basecamp(this, centerX, centerY);

		// Define basecamp dimensions for clear area calculation
		const basecampDimensions = this.basecamp.getDimensions();
		const clearPadding = 32; // Additional clear area around the basecamp

		// Calculate clear area boundaries
		const clearAreaLeft = centerX - (basecampDimensions.width / 2) - clearPadding;
		const clearAreaRight = centerX + (basecampDimensions.width / 2) + clearPadding;
		const clearAreaTop = centerY - (basecampDimensions.height / 2) - clearPadding;
		const clearAreaBottom = centerY + (basecampDimensions.height / 2) + clearPadding;

		// Helper function to check if position is in the clear area
		const isInsideClearArea = (x: number, y: number) => {
			return x >= clearAreaLeft && x <= clearAreaRight &&
				y >= clearAreaTop && y <= clearAreaBottom;
		};

		// Place environment objects
		this.createEnvironment(width, height, isInsideClearArea);

		// Create the player entity
		this.playerEntity = new Player(this, centerX, centerY);

		// Get the player sprite for physics collisions
		const playerSprite = this.playerEntity.getSprite();

		// Enable collisions for the player with environment
		this.physics.add.collider(playerSprite, this.trees);
		this.physics.add.collider(playerSprite, this.rocks);
		this.physics.add.collider(playerSprite, this.walls);

		// Debug: Log the number of objects in each physics group
		console.log("Trees in group:", this.trees.getChildren().length);
		console.log("Rocks in group:", this.rocks.getChildren().length);
		console.log("Walls in group:", this.walls.getChildren().length);
		console.log("Doors in group:", this.doors.getChildren().length);

		// Add virtual joystick
		const rexPlugin = this.plugins.get('rexvirtualjoystickplugin') as any;
		this.joystick = rexPlugin.add(this, {
			x: 100,
			y: this.cameras.main.height - 100,
			radius: 60,
			base: this.add.circle(0, 0, 60, 0x888888, 0.5),
			thumb: this.add.circle(0, 0, 30, 0xcccccc, 0.8)
		});

		// Create cursor keys for desktop controls
		this.cursorKeys = this.input.keyboard?.createCursorKeys();

		EventBus.emit('current-scene-ready', this);
	}

	createEnvironment(width: number, height: number, isInsideClearArea: (x: number, y: number) => boolean) {
		// Place trees randomly across the map
		const numberOfTrees = 25;
		const worldBoundsX = width;
		const worldBoundsY = height;

		for (let i = 0; i < numberOfTrees; i++) {
			// Generate random positions within the world bounds
			const x = Phaser.Math.Between(0, worldBoundsX);
			const y = Phaser.Math.Between(0, worldBoundsY);

			// Only place trees outside the clear area
			if (isInsideClearArea(x, y)) {
				i--;
				continue;
			}

			// Create tree entity and add to collection
			const treeEntity = new Tree(this, x, y);
			this.treeEntities.push(treeEntity);
		}

		// Place rocks randomly across the map
		const numberOfRocks = 15;
		for (let i = 0; i < numberOfRocks; i++) {
			const x = Phaser.Math.Between(0, worldBoundsX);
			const y = Phaser.Math.Between(0, worldBoundsY);

			if (isInsideClearArea(x, y)) {
				i--;
				continue;
			}

			const frame = Phaser.Math.Between(0, 3);

			// Create rock entity and add to collection
			const rockEntity = new Rock(this, x, y, frame);
			this.rockEntities.push(rockEntity);
		}
	}

	update() {
		// Calculate movement controls
		const controls = this.getPlayerControls();

		// Update the player entity with the controls
		if (this.playerEntity) {
			this.playerEntity.update(controls, this.cursorKeys);
		}
	}

	// Extract control logic to make update() cleaner
	getPlayerControls() {
		const speed = 100;
		let velocityX = 0;
		let velocityY = 0;

		// Process joystick input
		if (this.joystick && this.joystick.force > 0) {
			const angleRad = Phaser.Math.DegToRad(this.joystick.angle);
			velocityX = Math.cos(angleRad) * speed;
			velocityY = Math.sin(angleRad) * speed;
		}

		return { velocityX, velocityY };
	}
}