import type { Game } from '../scenes/Game';
import { Chicken } from '../Entities/Chicken';

export class ResourceManager {
    private scene: Game;
    private chickenEntities: Chicken[] = [];
    private chickenCount: number = 0;
    private chickenText: Phaser.GameObjects.Text | undefined;
    private chickenIcon: Phaser.GameObjects.Image | undefined;
    private chickenCostPerTower: number = 25; // Cost to build a tower

    constructor(scene: Game) {
        this.scene = scene;
        this.createUI();
    }

    // Create UI for resource display
    createUI() {
        // Add chicken counter and icon
        this.chickenIcon = this.scene.add.image(16 + 8, 50, 'chicken', 0);  // Use first frame of chicken sprite
        this.chickenIcon.setScale(0.8);  // Make it slightly smaller
        this.chickenIcon.setScrollFactor(0);  // Fix to camera
        this.chickenIcon.setDepth(100);  // Render on top

        this.chickenText = this.scene.add.text(16 + 16 + 8, 40, `x ${this.chickenCount}`, {
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 4, y: 4 }
        });
        this.chickenText.setScrollFactor(0);
        this.chickenText.setDepth(100);
    }

    // Set up collision handling for chicken collection
    setupCollections() {
        const playerSprite = this.scene.getPlayerEntity()?.getSprite();
        if (playerSprite && this.scene.chickens) {
            this.scene.physics.add.overlap(
                playerSprite,
                this.scene.chickens,
                this.handleChickenCollection,
                undefined,
                this
            );
        }
    }

    // Method to handle chicken collection
    handleChickenCollection(playerObj: Phaser.GameObjects.GameObject, chickenObj: Phaser.GameObjects.GameObject) {
        // Cast to sprite type
        const chickenSprite = chickenObj as Phaser.Physics.Arcade.Sprite;

        // Find the chicken entity associated with this sprite
        const collectedChicken = this.chickenEntities.find(
            chicken => chicken.getSprite() === chickenSprite
        );

        if (collectedChicken) {
            // Add chicken to counter and update UI
            this.addChicken(1);

            // Play collection sound if you have one
            // this.scene.sound.play('collect');

            // Remove the chicken
            collectedChicken.collect();

            // Remove from tracking array
            this.chickenEntities = this.chickenEntities.filter(
                chicken => chicken.getSprite() !== chickenSprite
            );
        }
    }

    // Drop a chicken at a specific location (called when slime dies)
    dropChicken(x: number, y: number) {
        const chicken = new Chicken(this.scene, x, y);
        this.chickenEntities.push(chicken);
    }

    // Add chickens to the counter
    addChicken(amount: number) {
        this.chickenCount += amount;
        this.updateChickenUI();
    }

    // Remove chickens from the counter
    removeChicken(amount: number) {
        this.chickenCount -= amount;
        if (this.chickenCount < 0) this.chickenCount = 0; // Prevent negative count
        this.updateChickenUI();
    }

    // Get the current chicken count
    getChickenCount(): number {
        return this.chickenCount;
    }

    // Get the tower cost in chickens
    getTowerCost(): number {
        return this.chickenCostPerTower;
    }

    // Update the chicken count UI
    updateChickenUI() {
        if (this.chickenText) {
            this.chickenText.setText(`x ${this.chickenCount}`);
        }
    }

    // Clean up resources when scene is shutdown
    shutdown() {
        this.chickenEntities.forEach(chicken => {
            if (chicken.getSprite()?.active) {
                chicken.getSprite().destroy();
            }
        });

        this.chickenEntities = [];

        if (this.chickenIcon) this.chickenIcon.destroy();
        if (this.chickenText) this.chickenText.destroy();
    }
}