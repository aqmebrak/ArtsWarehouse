import type { Game } from '../scenes/Game';

export class Chicken {
    private scene: Game;
    private chicken: Phaser.Physics.Arcade.Sprite; // Keep type hint for clarity

    constructor(scene: Game, x: number, y: number) {
        this.scene = scene;

        // Create the chicken sprite *without* physics initially
        // We'll let the static group handle physics body creation
        const chickenSprite = this.scene.add.sprite(x, y, 'chicken');

        // Add the sprite to the chickens static physics group in the scene
        if (scene.chickens) {
            scene.chickens.add(chickenSprite); // Add the regular sprite
            // Cast to Physics Sprite *after* adding, as the group enables physics
            this.chicken = chickenSprite as Phaser.Physics.Arcade.Sprite;
        } else {
            console.warn('Chickens group not found in scene.');
            // Fallback or error handling if group doesn't exist
            this.chicken = this.scene.physics.add.sprite(x, y, 'chicken'); // Create with physics as fallback
        }

        // Configure physics and animations if the sprite was successfully created/added
        if (this.chicken) {
            this.setupPhysics();
            this.createAnimations();
        }
    }

    setupPhysics() {
        // Check if the body exists (it should have been created by adding to the group)
        if (!this.chicken.body) {
            console.error("Chicken sprite body not found after adding to static group.");
            return;
        }

        // Cast body to Arcade.StaticBody for type safety
        const body = this.chicken.body as Phaser.Physics.Arcade.StaticBody;

        // Set up physics properties - setImmovable is inherent to StaticGroup members
        body.setSize(24, 24);  // Set collision size
        body.setOffset(4, 8);  // Adjust collision box position relative to sprite origin
        this.chicken.setDepth(0);      // Set depth so it appears under player/slimes

        // Refresh the static body to apply size/offset changes and position
        body.reset(this.chicken.x, this.chicken.y);
    }

    createAnimations() {
        if (!this.scene.anims.exists('chicken-idle')) {
            // Create animation for chicken idle
            this.scene.anims.create({
                key: 'chicken-idle',
                frames: this.scene.anims.generateFrameNumbers('chicken', { start: 0, end: 3 }),
                frameRate: 6,
                repeat: -1
            });
        }

        // Start playing the animation
        this.chicken.anims.play('chicken-idle', true);
    }

    getSprite() {
        return this.chicken;
    }

    collect() {
        // Play collection animation/sound if needed
        this.chicken.destroy();
    }
}
