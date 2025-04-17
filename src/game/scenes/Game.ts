import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Player } from '../Entities/Player';
import { Tree } from '../Entities/Tree';
import { Rock } from '../Entities/Rock';
import { Basecamp } from '../Entities/Basecamp';
import { Slime } from '../Entities/Slime';
import { Chicken } from '../Entities/Chicken';
import type VirtualJoyStick from 'phaser3-rex-plugins/plugins/input/virtualjoystick/VirtualJoyStick';


export class Game extends Scene {
	// Game variables
	private playerEntity: Player | undefined;
	joystick: VirtualJoyStick | undefined;
	cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

	// Entity collections
	private treeEntities: Tree[] = [];
	private rockEntities: Rock[] = [];
	private basecamp: Basecamp | undefined;
	private slimeEntities: Slime[] = [];

	// Timer for slime spawning
	private slimeSpawnTimer: Phaser.Time.TimerEvent | undefined;

	// Physics groups for collision detection - these need to be public so entities can access them
	trees: Phaser.Physics.Arcade.StaticGroup | undefined;
	rocks: Phaser.Physics.Arcade.StaticGroup | undefined;
	walls: Phaser.Physics.Arcade.StaticGroup | undefined;
	doors: Phaser.Physics.Arcade.StaticGroup | undefined;
	enemies: Phaser.Physics.Arcade.Group | undefined;
	chickens: Phaser.Physics.Arcade.Group | undefined; // Changed from StaticGroup to Group

	// Add chickens group and counter
	private chickenEntities: Chicken[] = [];
	private chickenCount: number = 0;
	private chickenText: Phaser.GameObjects.Text | undefined;
	private chickenIcon: Phaser.GameObjects.Image | undefined;

	// UI elements
	private healthText: Phaser.GameObjects.Text | undefined;

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
		this.chickens = this.physics.add.group(); // Changed from staticGroup to group

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

		// Enable collisions for the player with chickens (overlap to trigger collection)
		this.physics.add.overlap(
			playerSprite,
			this.chickens,
			// eslint-disable-next-line
			// @ts-ignore
			this.collectChicken,
			undefined,
			this
		);

		// Set up slime collisions
		this.physics.add.collider(this.enemies, this.trees);
		this.physics.add.collider(this.enemies, this.rocks);
		this.physics.add.collider(this.enemies, this.walls);
		this.physics.add.collider(this.enemies, this.doors);
		this.physics.add.collider(this.enemies, this.enemies); // Slimes collide with each other

		// Start spawning slimes
		this.setupSlimeSpawner();

		// Add virtual joystick
		const rexPlugin = this.plugins.get('rexVirtualJoystick');
		if (rexPlugin) {
			// eslint-disable-next-line
			// @ts-ignore
			this.joystick = rexPlugin.add(this, {
				x: 0, // Initial position doesn't matter as it will be hidden
				y: 0,
				radius: 30,
				base: this.add.circle(0, 0, 30, 0x888888, 0.5).setDepth(101), // Ensure joystick is above other UI
				thumb: this.add.circle(0, 0, 15, 0xcccccc, 0.8).setDepth(101),
				visible: false // Initially invisible
			});
			this.joystick?.setScrollFactor(0); // Ensure joystick stays fixed relative to the camera
		}
		// Create cursor keys for desktop controls
		this.cursorKeys = this.input.keyboard?.createCursorKeys();

		// --- Joystick Visibility Handling ---
		this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
			// Check if the pointer event is within the game canvas bounds
			if (pointer.x >= 0 && pointer.x <= this.cameras.main.width &&
				pointer.y >= 0 && pointer.y <= this.cameras.main.height) {

				// Position the joystick at the pointer location (relative to camera)
				this.joystick?.setPosition(pointer.x, pointer.y);
				this.joystick?.setVisible(true);
				this.joystick?.setEnable(true);
			}
		});

		this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {

			console.log('Pointer released', pointer, this.joystick);
			// If the released pointer is the one the joystick is tracking
			if (this.joystick?.pointer === pointer) {
				// Hide and disable the joystick
				this.joystick.setVisible(false);
				this.joystick.setEnable(false);
			}
		});
		// --- End Joystick Visibility Handling ---

		EventBus.emit('current-scene-ready', this);

		// Add player attack event listener
		this.events.on('player-attack', this.handlePlayerAttack, this);

		// Add health display
		this.healthText = this.add.text(16, 16, 'Health: 1000', {
			fontSize: '14px',
			color: '#ffffff',
			backgroundColor: '#000000',
			padding: { x: 4, y: 4 }
		});
		this.healthText.setScrollFactor(0); // Fix to camera so it stays on screen
		this.healthText.setDepth(100); // Make sure it renders on top

		// Add chicken counter and icon
		this.chickenIcon = this.add.image(16 + 8, 50, 'chicken', 0);  // Use first frame of chicken sprite
		this.chickenIcon.setScale(0.8);  // Make it slightly smaller
		this.chickenIcon.setScrollFactor(0);  // Fix to camera
		this.chickenIcon.setDepth(100);  // Render on top

		this.chickenText = this.add.text(16 + 16 + 8, 40, `x ${this.chickenCount}`, {
			fontSize: '12px',
			color: '#ffffff',
			backgroundColor: '#000000',
			padding: { x: 4, y: 4 }
		});
		this.chickenText.setScrollFactor(0);
		this.chickenText.setDepth(100);
	}

	setupSlimeSpawner() {
		// Spawn a slime every 10 seconds
		this.slimeSpawnTimer = this.time.addEvent({
			delay: 2500, // 10 seconds
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
		if (this.playerEntity && this.healthText) {
			this.playerEntity.update();

			// Update health display
			this.healthText.setText(`Health: ${this.playerEntity.getHealth()}`);
		}

		// Update all slimes to move toward the player
		this.slimeEntities.forEach(slime => slime.update());
	}

	handlePlayerAttack(targetSprite: Phaser.Physics.Arcade.Sprite) {
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

				// Drop chicken at slime's location
				this.dropChicken(targetSprite.x, targetSprite.y);
			}
		}
	}

	// Method to drop chicken at location (called by slime when it dies)
	dropChicken(x: number, y: number) {
		const chicken = new Chicken(this, x, y);
		this.chickenEntities.push(chicken);
	}

	// Method to handle chicken collection
	collectChicken(playerObj: Phaser.GameObjects.GameObject, chickenObj: Phaser.GameObjects.GameObject) {
		// Cast the objects back to sprites since we know they are sprites
		const chickenSprite = chickenObj as Phaser.Physics.Arcade.Sprite;

		// Find the chicken entity associated with this sprite
		const collectedChicken = this.chickenEntities.find(
			chicken => chicken.getSprite() === chickenSprite
		);

		if (collectedChicken) {
			// Increment counter and update UI
			this.chickenCount++;
			if (this.chickenText)
				this.chickenText.setText(`x ${this.chickenCount}`);

			// Play collection sound if you have one
			// this.sound.play('collect');

			// Remove the chicken
			collectedChicken.collect();

			// Remove from our tracking array
			this.chickenEntities = this.chickenEntities.filter(
				chicken => chicken.getSprite() !== chickenSprite
			);
		}
	}
}
