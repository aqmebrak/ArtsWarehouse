import type { Game } from '../scenes/Game';

export class Chicken {
    private scene: Game;
    private chicken: Phaser.Physics.Arcade.Sprite;

    constructor(scene: Game, x: number, y: number) {
        this.scene = scene;

        // Create the chicken sprite
        this.chicken = this.scene.physics.add.sprite(x, y, 'chicken');

        // Add the sprite to the chickens physics group in the scene
        if (scene.chickens && scene.chickens instanceof Phaser.Physics.Arcade.StaticGroup) {
            scene.chickens.add(this.chicken);
        }

        this.setupPhysics();
        this.createAnimations();
    }

    setupPhysics() {
        // Set up physics properties
        this.chicken.setSize(24, 24);  // Set collision size
        this.chicken.setOffset(4, 8);  // Adjust collision box position
        this.chicken.setDepth(0);      // Set depth so it appears under player/slimes
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
