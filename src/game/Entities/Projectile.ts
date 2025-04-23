import type { Game } from '../scenes/Game';

export class Projectile {
	private scene: Game;
	private projectileSprite: Phaser.Physics.Arcade.Sprite;
	private speed: number = 250; // Speed of the projectile
	private lifespan: number = 1500; // Max time projectile exists in ms
	private damage: number;

	constructor(
		scene: Game,
		x: number,
		y: number,
		targetX: number,
		targetY: number,
		damage: number
	) {
		this.scene = scene;
		this.damage = damage;

		// Create the projectile sprite ('kunai')
		this.projectileSprite = this.scene.physics.add.sprite(x, y, 'kunai');

		// Add to the scene's projectiles group
		if (
			this.scene.projectiles &&
			this.scene.projectiles instanceof Phaser.Physics.Arcade.Group
		) {
			this.scene.projectiles.add(this.projectileSprite);
		}

		// Store damage on the sprite itself for easy access in collision handlers
		this.projectileSprite.setData('damage', this.damage);
		// Store a reference to this instance if needed for more complex interactions
		this.projectileSprite.setData('projectileInstance', this);

		this.setupPhysics(targetX, targetY);

		// Destroy the projectile after its lifespan if it hasn't hit anything
		this.scene.time.delayedCall(this.lifespan, () => {
			this.destroy(); // Call our destroy method
		});
	}

	setupPhysics(targetX: number, targetY: number) {
		this.projectileSprite.setDepth(2); // Ensure projectiles are visible above most things
		// Adjust hitbox if needed, e.g., make it smaller than the visual
		const bodyRadius = this.projectileSprite.width / 4;
		this.projectileSprite.body?.setCircle(bodyRadius);
		// Offset might be needed depending on the circle radius and sprite origin
		// this.projectileSprite.body?.setOffset(offsetX, offsetY);

		// Calculate angle towards target
		const angle = Phaser.Math.Angle.Between(
			this.projectileSprite.x,
			this.projectileSprite.y,
			targetX,
			targetY
		);
		this.projectileSprite.setRotation(angle + Math.PI / 2); // Point kunai towards target (+90 degrees offset depending on asset orientation)

		// Set velocity towards target
		this.scene.physics.velocityFromRotation(
			angle,
			this.speed,
			this.projectileSprite.body?.velocity
		);

		// Enable overlap checks (important for projectile collisions)
		(this.projectileSprite.body as Phaser.Physics.Arcade.Body).onOverlap = true;

		// Prevent collision response (projectiles should pass through each other)
		// (this.projectileSprite.body as Phaser.Physics.Arcade.Body).setCollisionResponse(false); // Might not be needed if using overlap only
	}

	getSprite() {
		return this.projectileSprite;
	}

	getDamage() {
		return this.damage;
	}

	// Method to handle destruction, called on hit or lifespan end
	destroy() {
		// Check if sprite exists and is active before destroying
		if (this.projectileSprite && this.projectileSprite.active) {
			// Optional: Add explosion/impact effect here
			// e.g., this.scene.add.sprite(this.projectileSprite.x, this.projectileSprite.y, 'impact_effect').play('impact_anim').on('animationcomplete', sprite => sprite.destroy());
			this.projectileSprite.destroy();
		}
		// Note: Further cleanup might be needed if this Projectile instance is stored elsewhere
	}
}
