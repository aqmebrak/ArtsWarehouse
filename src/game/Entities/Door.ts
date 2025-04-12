import type { Game } from '../scenes/Game';

export class Door {
    private scene: Game;
    private door: Phaser.Physics.Arcade.Sprite;

    constructor(scene: Game, x: number, y: number) {
        this.scene = scene;

        // Create the door sprite
        this.door = this.scene.physics.add.staticSprite(x, y, 'door');

        // Add the sprite to the doors physics group in the scene
        if (scene.doors && scene.doors instanceof Phaser.Physics.Arcade.StaticGroup) {
            scene.doors.add(this.door);
        }

        this.setupPhysics();
    }

    setupPhysics() {
        this.door.width = 32;
        // this.door.setSize(32, 16);  // Set appropriate collision size
        this.door.refreshBody();
    }

    getSprite() {
        return this.door;
    }
}