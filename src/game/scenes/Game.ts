import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene {
	// Game variables
	player: any;
	joystick: any;
	cursorKeys: any;
	trees: any;
	rocks: any;
	playerDirection: string = 'down'; // Track player direction for animations
	isPlayerMoving: boolean = false;

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

		// Create trees group with physics
		this.trees = this.physics.add.staticGroup();

		// Create rocks group with physics
		this.rocks = this.physics.add.staticGroup();

		// Set world center to (0, 0) and define clear radius around the player
		const centerX = width / 2;
		const centerY = height / 2;
		const clearRadius = Math.min(width, height) * 0.2; // Size of the empty area in the middle

		// Place only a few trees randomly across the map
		const numberOfTrees = 50; // Adjust this number to control tree density
		const worldBoundsX = width;
		const worldBoundsY = height;

		for (let i = 0; i < numberOfTrees; i++) {
			// Generate random positions within the world bounds
			const x = Phaser.Math.Between(0, worldBoundsX);
			const y = Phaser.Math.Between(0, worldBoundsY);

			// Calculate distance from world center
			const distance = Phaser.Math.Distance.Between(x, y, centerX, centerY);

			// Only place trees outside the clear radius (middle area)
			// If position is inside clear radius, try again
			if (distance <= clearRadius) {
				i--; // Try again
				continue;
			}

			// Add some natural-looking variation to tree size
			const scale = Phaser.Math.FloatBetween(1, 1.4);
			const tree = this.trees.create(x, y, 'tree');
			tree.setScale(scale);
		}

		// Place some rocks across the map
		const numberOfRocks = 23; // Adjust as needed

		for (let i = 0; i < numberOfRocks; i++) {
			// Generate random positions within the world bounds
			const x = Phaser.Math.Between(0, worldBoundsX);
			const y = Phaser.Math.Between(0, worldBoundsY);

			// Calculate distance from world center
			const distance = Phaser.Math.Distance.Between(x, y, centerX, centerY);

			// Only place rocks outside the clear radius (middle area)
			if (distance <= clearRadius) {
				i--; // Try again
				continue;
			}

			// Select a random rock type/frame from the spritesheet
			const frame = Phaser.Math.Between(0, 3); // Adjust based on actual frames in your spritesheet

			// Add some natural-looking variation to rock size
			const scale = Phaser.Math.FloatBetween(0.8, 1.2);
			const rock = this.rocks.create(x, y, 'rocks', frame);
			rock.setScale(scale);
		}

		// Create player at the center of the game world
		this.player = this.physics.add.sprite(centerX, centerY, 'player');
		this.player.setCollideWorldBounds(true);

		// Adjust the player's hitbox to better match the character sprite
		// The actual character occupies only a small portion of the frame
		// Creating a smaller hitbox centered in the frame
		this.player.body.setSize(24, 30); // Set to approximately half the frame size
		this.player.body.setOffset(12, 20); // Center the hitbox in the lower part of the sprite

		// Create player animations based on spritesheet rows with 6 frames per row
		// Row 1: Idle animations
		this.anims.create({
			key: 'idle-down',
			frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
			frameRate: 5,
			repeat: -1
		});

		// Row 2: Moving right (and flipped for left)
		this.anims.create({
			key: 'move-right',
			frames: this.anims.generateFrameNumbers('player', { start: 6, end: 11 }),
			frameRate: 10,
			repeat: -1
		});

		this.anims.create({
			key: 'move-left',
			frames: this.anims.generateFrameNumbers('player', { start: 6, end: 11 }),
			frameRate: 10,
			repeat: -1
		});

		// Row 3: Moving up
		this.anims.create({
			key: 'move-up',
			frames: this.anims.generateFrameNumbers('player', { start: 12, end: 17 }),
			frameRate: 10,
			repeat: -1
		});

		// Row 4: Moving down
		this.anims.create({
			key: 'move-down',
			frames: this.anims.generateFrameNumbers('player', { start: 18, end: 23 }),
			frameRate: 10,
			repeat: -1
		});

		// Enable collision between player and trees
		this.physics.add.collider(this.player, this.trees);

		// Enable collision between player and rocks
		this.physics.add.collider(this.player, this.rocks);

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
		// this.dumpJoyStickState();

		EventBus.emit('current-scene-ready', this);
	}

	update() {
		// Player speed
		const speed = 200;

		// Reset velocity and track if player is moving
		this.player.setVelocity(0);
		this.isPlayerMoving = false;

		// Variables to track movement direction
		let velocityX = 0;
		let velocityY = 0;

		// Handle joystick input
		if (this.joystick.force > 0) {
			// Convert angle to radians and calculate velocity components
			const angleRad = Phaser.Math.DegToRad(this.joystick.angle);
			velocityX = Math.cos(angleRad) * speed;
			velocityY = Math.sin(angleRad) * speed;

			// Set player velocity based on joystick angle
			this.player.setVelocity(velocityX, velocityY);
			this.isPlayerMoving = true;
		}

		// Handle keyboard input as alternative
		if (this.cursorKeys.left.isDown) {
			velocityX = -speed;
			this.player.setVelocityX(-speed);
			this.isPlayerMoving = true;
		} else if (this.cursorKeys.right.isDown) {
			velocityX = speed;
			this.player.setVelocityX(speed);
			this.isPlayerMoving = true;
		}

		if (this.cursorKeys.up.isDown) {
			velocityY = -speed;
			this.player.setVelocityY(-speed);
			this.isPlayerMoving = true;
		} else if (this.cursorKeys.down.isDown) {
			velocityY = speed;
			this.player.setVelocityY(speed);
			this.isPlayerMoving = true;
		}

		// Determine animation based on direction and movement
		if (this.isPlayerMoving) {
			// Determine the primary direction of movement
			if (Math.abs(velocityX) > Math.abs(velocityY)) {
				// Moving horizontally
				if (velocityX > 0) {
					// Right movement
					this.playerDirection = 'right';
					this.player.setFlipX(false);
					this.player.anims.play('move-right', true);
				} else {
					// Left movement
					this.playerDirection = 'left';
					this.player.setFlipX(true); // Flip sprite horizontally for left movement
					this.player.anims.play('move-left', true);
				}
			} else {
				// Moving vertically
				if (velocityY > 0) {
					// Down movement
					this.playerDirection = 'down';
					this.player.setFlipX(false);
					this.player.anims.play('move-down', true);
				} else {
					// Up movement
					this.playerDirection = 'up';
					this.player.setFlipX(false);
					this.player.anims.play('move-up', true);
				}
			}
		} else {
			// Player is idle - play idle animation based on last direction
			this.player.anims.play('idle-down', true);
			// For now we just use the idle-down animation
			// Later we can add directional idle animations if needed
		}
	}
}