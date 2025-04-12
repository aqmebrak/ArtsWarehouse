import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Player } from '../Entities/Player';
import { Tree } from '../Entities/Tree';
import { Rock } from '../Entities/Rock';
import { Basecamp } from '../Entities/Basecamp';
import { Door } from '../Entities/Door';
import { Slime } from '../Entities/Slime';

export class Game extends Scene {
	// Game variables
	private playerEntity: Player | undefined;
	joystick: any;
	cursorKeys: any;

	// Entity collections
	private treeEntities: Tree[] = [];
	private rockEntities: Rock[] = [];
	private basecamp: Basecamp | undefined;
	private slimeEntities: Slime[] = [];

	// Timer for slime spawning
	private slimeSpawnTimer: Phaser.Time.TimerEvent;

	// Physics groups for collision detection - these need to be public so entities can access them
	trees: Phaser.Physics.Arcade.StaticGroup;
	rocks: Phaser.Physics.Arcade.StaticGroup;
	walls: Phaser.Physics.Arcade.StaticGroup;
	doors: Phaser.Physics.Arcade.StaticGroup;
	enemies: Phaser.Physics.Arcade.Group;

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
		this.enemies = this.physics.add.group();

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
		// this.physics.add.collider(playerSprite, this.doors);

		// Set up slime collisions
		this.physics.add.collider(this.enemies, this.trees);
		this.physics.add.collider(this.enemies, this.rocks);
		this.physics.add.collider(this.enemies, this.walls);
		this.physics.add.collider(this.enemies, this.doors);
		this.physics.add.collider(this.enemies, this.enemies); // Slimes collide with each other

		// Start spawning slimes
		this.setupSlimeSpawner();

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

		// Add player attack event listener
		this.events.on('player-attack', this.handlePlayerAttack, this);
	}

	setupSlimeSpawner() {
		// Spawn a slime every 10 seconds
		this.slimeSpawnTimer = this.time.addEvent({
			delay: 10000, // 10 seconds
			callback: this.spawnSlime,
			callbackScope: this,
			loop: true
		});

		// Spawn initial slime
		this.spawnSlime();
	}

	spawnSlime() {
		if (!this.playerEntity) return;

		const width = this.cameras.main.width;
		const height = this.cameras.main.height;

		// Define spawn areas near the corners of the map
		const spawnAreas = [
			{ x: 50, y: 50, width: 100, height: 100 }, // Top-left
			{ x: width - 150, y: 50, width: 100, height: 100 }, // Top-right
			{ x: 50, y: height - 150, width: 100, height: 100 }, // Bottom-left
			{ x: width - 150, y: height - 150, width: 100, height: 100 } // Bottom-right
		];

		// Select a random spawn area
		const area = Phaser.Utils.Array.GetRandom(spawnAreas);

		// Calculate a random position within the selected area
		const x = Phaser.Math.Between(area.x, area.x + area.width);
		const y = Phaser.Math.Between(area.y, area.y + area.height);

		// Create new slime and add to the collection
		const slime = new Slime(this, x, y, this.playerEntity);
		this.slimeEntities.push(slime);

		// Limit the number of slimes to prevent overwhelming the player
		if (this.slimeEntities.length > 25) {
			const oldestSlime = this.slimeEntities.shift();
			if (oldestSlime) {
				oldestSlime.destroy();
			}
		}
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
		// Update the player entity with the controls
		if (this.playerEntity) {
			this.playerEntity.update();
		}

		// Update all slimes to move toward the player
		this.slimeEntities.forEach(slime => slime.update());
	}

	handlePlayerAttack(targetSprite: Phaser.Physics.Arcade.Sprite) {
		console.log('Player attacked:', targetSprite);
		if (!this.playerEntity) return;

		// Find the slime entity associated with this sprite
		const attackedSlime = this.slimeEntities.find(
			slime => slime.getSprite() === targetSprite
		);

		if (attackedSlime) {
			// Apply damage from player to slime
			attackedSlime.takeDamage(this.playerEntity.getAttackDamage());

			// If the slime was destroyed, remove it from our array
			if (!targetSprite.active) {
				this.slimeEntities = this.slimeEntities.filter(
					slime => slime.getSprite() !== targetSprite
				);
			}
		}
	}
}