import type VirtualJoyStick from 'phaser3-rex-plugins/plugins/input/virtualjoystick/VirtualJoyStick';

import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Player } from '../Entities/Player';
import { Tree } from '../Entities/Tree';
import { Rock } from '../Entities/Rock';
import { Basecamp } from '../Entities/Basecamp';
import { Slime } from '../Entities/Slime';
import { Chicken } from '../Entities/Chicken';
import { Tower } from '../Entities/Tower'; // Import Tower
import { Projectile } from '../Entities/Projectile'; // Import Projectile



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
	private towerEntities: Tower[] = []; // Array to hold Tower instances

	// Timer for slime spawning
	private slimeSpawnTimer: Phaser.Time.TimerEvent | undefined;

	// Physics groups for collision detection - these need to be public so entities can access them
	trees: Phaser.Physics.Arcade.StaticGroup | undefined;
	rocks: Phaser.Physics.Arcade.StaticGroup | undefined;
	walls: Phaser.Physics.Arcade.StaticGroup | undefined;
	doors: Phaser.Physics.Arcade.StaticGroup | undefined;
	enemies: Phaser.Physics.Arcade.Group | undefined;
	chickens: Phaser.Physics.Arcade.Group | undefined; // Changed from StaticGroup to Group
	buildSpots: Phaser.Physics.Arcade.StaticGroup | undefined; // Group for tower build spots
	towers: Phaser.Physics.Arcade.Group | undefined; // Group for active towers (their sprites)
	projectiles: Phaser.Physics.Arcade.Group | undefined; // Group for projectiles

	// Add chickens group and counter
	private chickenEntities: Chicken[] = [];
	private chickenCount: number = 0;
	private chickenText: Phaser.GameObjects.Text | undefined;
	private chickenIcon: Phaser.GameObjects.Image | undefined;
	private chickenCostPerTower: number = 25; // Cost to build a tower

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
		this.buildSpots = this.physics.add.staticGroup();
		this.towers = this.physics.add.group(); // Use a dynamic group for towers if they might move (unlikely) or need updates
		this.projectiles = this.physics.add.group({ // Projectiles are dynamic
			classType: Phaser.Physics.Arcade.Sprite, // Specify class type if needed
			runChildUpdate: true // Optional: if projectiles have their own update logic
		});

		// Set world center
		const centerX = width / 2;
		const centerY = height / 2;

		// Create basecamp and store it
		this.basecamp = new Basecamp(this, centerX, centerY);

		// Define basecamp dimensions for clear area calculation
		const basecampDimensions = this.basecamp.getDimensions();
		const clearPadding = 32; // Additional clear area around the basecamp
		// Place initial build spots at basecamp corners
		this.createBuildSpots(basecampDimensions);

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

		this.physics.add.overlap(
			playerSprite,
			this.buildSpots,
			this.handleBuildAttempt, // Callback function
			null, // Process callback (optional)
			this // Context for the callback
		);

		// Set up slime collisions
		this.physics.add.collider(this.enemies, this.trees);
		this.physics.add.collider(this.enemies, this.rocks);
		this.physics.add.collider(this.enemies, this.walls);
		this.physics.add.collider(this.enemies, this.doors);
		this.physics.add.collider(this.enemies, this.enemies); // Slimes collide with each other
		this.physics.add.collider(this.enemies, this.towers); // Enemies collide with towers

		// Set up projectile collisions
		this.physics.add.overlap(
			this.projectiles,
			this.enemies,
			this.handleProjectileHit, // Callback for projectile hitting enemy
			null,
			this
		);

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
			// If the released pointer is the one the joystick is tracking
			// Hide and disable the joystick
			this.joystick?.setVisible(false);
			this.joystick?.setEnable(false);

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
			delay: 1200, // 10 seconds
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
			{ x: width - 50, y: 50, width: 100, height: 100 }, // Top-right
			{ x: 50, y: height - 50, width: 100, height: 100 }, // Bottom-left
			{ x: width - 50, y: height - 50, width: 100, height: 100 } // Bottom-right
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
		if (this.slimeEntities.length > 40) {
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

	update(time: number, delta: number) {
		// Update the player entity with the controls
		if (this.playerEntity && this.healthText) {
			this.playerEntity.update();

			// Update health display
			this.healthText.setText(`Health: ${this.playerEntity.getHealth()}`);
		}

		// Update all slimes to move toward the player
		this.slimeEntities.forEach(slime => slime.update());

		// Update all active towers
		this.towerEntities.forEach(tower => tower.update(time, delta));
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

			this.addChicken(1); // Add 1 chicken when collected
		}
	}

	createBuildSpots(basecampDimensions: { width: number, height: number, centerX: number, centerY: number }) {
		const halfWidth = basecampDimensions.width / 2;
		const halfHeight = basecampDimensions.height / 2;
		const cornerOffset = 16; // Offset from the exact corner

		const positions = [
			{ x: basecampDimensions.centerX - halfWidth - cornerOffset, y: basecampDimensions.centerY - halfHeight - cornerOffset }, // Top-left
			{ x: basecampDimensions.centerX + halfWidth + cornerOffset, y: basecampDimensions.centerY - halfHeight - cornerOffset }, // Top-right
			{ x: basecampDimensions.centerX - halfWidth - cornerOffset, y: basecampDimensions.centerY + halfHeight + cornerOffset }, // Bottom-left
			{ x: basecampDimensions.centerX + halfWidth + cornerOffset, y: basecampDimensions.centerY + halfHeight + cornerOffset }  // Bottom-right
		];

		positions.forEach(pos => {
			const spot = this.buildSpots?.create(pos.x, pos.y, 'blue_tile');
			spot.setData('isBuilt', false); // Mark spot as not built initially
			spot.refreshBody(); // Apply physics changes
		});
	}

	handleBuildAttempt(playerSprite: Phaser.GameObjects.GameObject, buildSpotSprite: Phaser.GameObjects.GameObject) {
		// Cast to specific types if needed (though GameObject is often sufficient)
		const spot = buildSpotSprite as Phaser.Physics.Arcade.Sprite;

		// Check if a tower is already built here and if player has enough chickens
		if (!spot.getData('isBuilt') && this.chickenCount >= this.chickenCostPerTower) {
			// Deduct cost
			this.removeChicken(this.chickenCostPerTower);

			// Mark spot as built
			spot.setData('isBuilt', true);
			spot.setVisible(false); // Hide the blue tile
			spot.disableBody(true, true); // Disable physics and hide

			// Create the tower entity
			const tower = new Tower(this, spot.x, spot.y);
			this.towerEntities.push(tower); // Add to our list for updates

			// Optional: Add a build sound effect
			// this.sound.play('build_sound');
		}
	}

	handleProjectileHit(projectileSprite: Phaser.GameObjects.GameObject, enemySprite: Phaser.GameObjects.GameObject) {
		// Find the corresponding Projectile instance (if needed, e.g., to get damage)
		// This assumes the projectile group contains sprites directly linked to Projectile instances
		// A more robust way might involve mapping sprites to instances if complex logic is needed.
		// For now, we'll assume the Projectile class handles its own destruction and damage application logic.

		// Find the Slime instance associated with the enemy sprite
		const hitSlime = this.slimeEntities.find(slime => slime.getSprite() === enemySprite);

		if (hitSlime && projectileSprite.active) {
			// Find the projectile instance (might need a better way to link sprite to instance)
			// For simplicity, let's assume the projectile sprite has damage data or we find the instance
			// A simple approach: iterate projectiles (less efficient) or use setData on sprite
			// Let's assume Projectile handles its damage internally for now.

			// We need the Projectile instance to get its damage value.
			// A simple, less efficient way:
			// Find the projectile instance that owns this sprite.
			// This requires Projectile instances to be tracked, e.g., in an array in Game.ts
			// Let's modify Projectile to store damage on its sprite data for easier access here.

			const damage = projectileSprite.getData('damage') as number || 0; // Retrieve damage

			if (damage > 0) {
				hitSlime.takeDamage(damage);
			}

			// Destroy the projectile sprite immediately
			// Find the Projectile instance and call its destroy method
			// This is complex without a direct link. Let's modify Projectile.ts to handle this.
			// For now, just destroy the sprite. The Projectile instance might linger.
			projectileSprite.destroy(); // Destroy the visual projectile
		}
	}

	// --- Chicken Management ---
	addChicken(amount: number) {
		this.chickenCount += amount;
		this.updateChickenUI();
	}

	removeChicken(amount: number) {
		this.chickenCount -= amount;
		if (this.chickenCount < 0) this.chickenCount = 0; // Prevent negative count
		this.updateChickenUI();
	}

	getChickenCount(): number {
		return this.chickenCount;
	}

	updateChickenUI() {
		this.chickenText?.setText(`x ${this.chickenCount}`);
	}
	// --- End Chicken Management ---

	// --- Helper to get active slimes ---
	getSlimeEntities(): Slime[] {
		// Filter out destroyed slimes if necessary, or ensure slimeEntities array is kept clean
		return this.slimeEntities.filter(slime => slime.getSprite()?.active);
	}
	// --- End Helper ---
}
