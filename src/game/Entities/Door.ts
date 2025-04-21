import type { Game } from '../scenes/Game';

export class Door {
    private scene: Game;
    private doorSprite: Phaser.Physics.Arcade.Sprite;
    private health: number = 100; // Doors now have health
    private maxHealth: number = 100;
    private isDestroyedFlag: boolean = false;
    private healthBar: Phaser.GameObjects.Graphics | null = null;

    constructor(scene: Game, x: number, y: number) {
        this.scene = scene;

        // Create the door sprite and add it to the scene's doors group
        this.doorSprite = this.scene.physics.add.sprite(x, y, 'wooden_door');
        if (scene.doors) {
            scene.doors.add(this.doorSprite);
        }

        // Set physics properties
        this.doorSprite.setImmovable(true);
        this.doorSprite.body.allowGravity = false;
        this.doorSprite.setDepth(0); // Ensure doors are behind player/enemies

        // Adjust hitbox if necessary (example)
        // this.doorSprite.setSize(32, 16);
        // this.doorSprite.setOffset(0, 0);

        // Create health bar
        this.createHealthBar();
    }

    private createHealthBar() {
        this.healthBar = this.scene.add.graphics();
        this.updateHealthBar();
        this.healthBar.setDepth(1); // Ensure health bar is visible
    }

    private updateHealthBar() {
        if (!this.healthBar) return;

        this.healthBar.clear();

        // Don't draw if destroyed or full health
        if (this.isDestroyedFlag || this.health >= this.maxHealth) {
            return;
        }

        const barWidth = this.doorSprite.width * 0.8;
        const barHeight = 4;
        const barX = this.doorSprite.x - barWidth / 2;
        const barY = this.doorSprite.y - this.doorSprite.height / 2 - barHeight - 2; // Position above the door

        // Background of the health bar (e.g., dark red)
        this.healthBar.fillStyle(0x8B0000, 0.7);
        this.healthBar.fillRect(barX, barY, barWidth, barHeight);

        // Foreground of the health bar (e.g., bright red)
        const healthPercentage = this.health / this.maxHealth;
        this.healthBar.fillStyle(0xff0000, 1);
        this.healthBar.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
    }

    takeDamage(amount: number) {
        if (this.isDestroyedFlag) return; // Cannot damage a destroyed door

        this.health -= amount;
        this.updateHealthBar();

        // Flash effect
        this.doorSprite.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (!this.isDestroyedFlag) {
                this.doorSprite.clearTint();
            }
        });

        if (this.health <= 0) {
            this.destroy();
        }
    }

    destroy() {
        if (this.isDestroyedFlag) return;

        this.isDestroyedFlag = true;
        this.health = 0;
        console.log('Door destroyed!');

        // Visual indication of destruction (e.g., make transparent or change texture)
        this.doorSprite.setAlpha(0.3);
        // Optionally disable physics body so things can pass through
        this.doorSprite.disableBody(true, false); // Disables physics but doesn't hide sprite immediately

        if (this.healthBar) {
            this.healthBar.destroy();
            this.healthBar = null;
        }

        // Notify the scene or basecamp that a door was destroyed
        this.scene.events.emit('door-destroyed');
    }

    getSprite() {
        return this.doorSprite;
    }

    isDestroyed(): boolean {
        return this.isDestroyedFlag;
    }

    // Method to clean up when the scene shuts down
    shutdown() {
        if (this.healthBar) {
            this.healthBar.destroy();
        }
        // The sprite itself will be managed by the group in the scene
    }
}