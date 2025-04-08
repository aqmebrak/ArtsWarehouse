<script lang="ts">
	// export const prerender = false; // important!
	// export const csr = true;
	// export const ssr = true;
	import { onMount } from 'svelte';
	import type Phaser from 'phaser';

	let game: Phaser.Game;
	let gameContainer: HTMLElement;

	onMount(async () => {
		const Phaser = await import('phaser');

		const config: Phaser.Types.Core.GameConfig = {
			type: Phaser.AUTO,
			width: window.innerWidth * 0.8,
			height: window.innerHeight * 0.8,
			parent: gameContainer,
			physics: {
				default: 'arcade',
				arcade: {
					gravity: { x: 0, y: 0 },
					debug: true
				}
			},
			scale: {
				mode: Phaser.Scale.FIT,
				autoCenter: Phaser.Scale.CENTER_BOTH
			},
			scene: {
				preload: preload,
				create: create,
				update: update
			}
		};

		game = new Phaser.Game(config);

		return () => {
			game.destroy(true);
		};
	});

	// Game variables
	let player;
	let joystick;
	let cursorKeys;
	let trees;

	function preload(this: Phaser.Scene) {
		// Load joystick plugin
		this.load.plugin('rexvirtualjoystickplugin',
			'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js',
			true
		);
	}

	function create(this: Phaser.Scene) {
		const width = this.cameras.main.width;
		const height = this.cameras.main.height;
		
		// Add grass background with tiling
		const backgroundImage = this.add.tileSprite(0, 0, width * 2, height * 2, 'grass');
		backgroundImage.setOrigin(0, 0);
		backgroundImage.setPosition(-width/2, -height/2);
		
		// Create trees group with physics
		trees = this.physics.add.staticGroup();
		
		// Add trees around the edges, leaving the middle clear
		const centerX = width / 2;
		const centerY = height / 2;
		const clearRadius = Math.min(width, height) * 0.3; // Size of the empty area in the middle
		
		// Place trees in a grid-like pattern
		for(let x = 50; x < width; x += 100) {
			for(let y = 50; y < height; y += 100) {
				// Calculate distance from center
				const distance = Phaser.Math.Distance.Between(x, y, centerX, centerY);
				
				// Only place trees outside the clear radius (middle area)
				if(distance > clearRadius) {
					// Add some randomness to tree placement
					const offsetX = Phaser.Math.Between(-20, 20);
					const offsetY = Phaser.Math.Between(-20, 20);
					
					const tree = trees.create(x + offsetX, y + offsetY, 'tree');
					// Scale down trees a bit
					tree.setScale(0.6);
				}
			}
		}

		// Create player at the center of the screen
		player = this.physics.add.sprite(
			centerX,
			centerY,
			'player'
		);

		player.setCollideWorldBounds(true);
		
		// Enable collision between player and trees
		this.physics.add.collider(player, trees);

		// Add virtual joystick
		joystick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
			x: 100,
			y: this.cameras.main.height - 100,
			radius: 60,
			base: this.add.circle(0, 0, 60, 0x888888, 0.5),
			thumb: this.add.circle(0, 0, 30, 0xcccccc, 0.8)
		})
			.on('update', dumpJoyStickState, this);


		// Create cursor keys for desktop controls
		cursorKeys = this.input.keyboard.createCursorKeys();
		dumpJoyStickState();
	}

	const dumpJoyStickState = () => {
		var cursorKeys = joystick.createCursorKeys();
		var s = 'Key down: ';
		for (var name in cursorKeys) {
			if (cursorKeys[name].isDown) {
				s += `${name} `;
			}
		}

		s += `
Force: ${Math.floor(joystick.force * 100) / 100}
Angle: ${Math.floor(joystick.angle * 100) / 100}
`;

		s += '\nTimestamp:\n';
		for (var name in cursorKeys) {
			var key = cursorKeys[name];
			s += `${name}: duration=${key.duration / 1000}\n`;
		}
		console.log(s);
	};

	function update(this: Phaser.Scene) {
		// Player speed
		const speed = 200;

		// Reset velocity
		player.setVelocity(0);

		// Handle joystick input
		if (joystick.force > 0) {
			// Convert angle to radians and calculate velocity components
			const angleRad = Phaser.Math.DegToRad(joystick.angle);
			const velocityX = Math.cos(angleRad) * speed;
			const velocityY = Math.sin(angleRad) * speed;
			
			// Set player velocity based on joystick angle
			player.setVelocity(velocityX, velocityY);
		}

		// Handle keyboard input as alternative
		if (cursorKeys.left.isDown) {
			player.setVelocityX(-speed);
		} else if (cursorKeys.right.isDown) {
			player.setVelocityX(speed);
		}

		if (cursorKeys.up.isDown) {
			player.setVelocityY(-speed);
		} else if (cursorKeys.down.isDown) {
			player.setVelocityY(speed);
		}
	}
</script>

<svelte:head>
	<title>2D Character Game</title>
	<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport" />
</svelte:head>

<div bind:this={gameContainer} class="game-container"></div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        overflow: hidden;
        touch-action: none;
    }

    .game-container {
        width: 100%;
        height: 80vh;
        display: block;
        background-color: #333;
    }
</style>

