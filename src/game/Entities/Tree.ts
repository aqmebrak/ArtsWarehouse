import type { Game } from '../scenes/Game';

export class Tree {
    private scene: Game;
    private tree: Phaser.Physics.Arcade.Sprite;

    constructor(scene: Game, x: number, y: number) {
        this.scene = scene;

        // Create the tree sprite
        this.tree = this.scene.physics.add.staticSprite(x, y, 'tree');

        // Add the sprite to the trees physics group in the scene
        if (scene.trees && scene.trees instanceof Phaser.Physics.Arcade.StaticGroup) {
            scene.trees.add(this.tree);
        }

        this.setupPhysics();
    }

    setupPhysics() {
        this.tree.setScale(1 / 3);
        // this.tree.setOrigin(0.5, 0.5);
        this.tree.setSize(12, 14);  // Set appropriate collision size
        this.tree.setOffset(25, 30); // Offset the hitbox to position it correctly relative to the visible sprite
        // this.tree.refreshBody();
    }

    getSprite() {
        return this.tree;
    }
}