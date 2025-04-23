import type { Game } from '../scenes/Game';

export class Rock {
	private scene: Game;
	private rock: Phaser.Physics.Arcade.Sprite;

	constructor(scene: Game, x: number, y: number, frame: number) {
		this.scene = scene;

		// Create the rock sprite
		this.rock = this.scene.physics.add.staticSprite(x, y, 'rocks', frame);

		// Add the sprite to the rocks physics group in the scene
		if (scene.rocks && scene.rocks instanceof Phaser.Physics.Arcade.StaticGroup) {
			scene.rocks.add(this.rock);
		}

		this.setupPhysics();
	}

	setupPhysics() {
		const scale = Phaser.Math.FloatBetween(0.8, 1.2);
		this.rock.setScale(scale);
		this.rock.setSize(14, 14); // Set appropriate collision size
		this.rock.refreshBody();
	}
}
