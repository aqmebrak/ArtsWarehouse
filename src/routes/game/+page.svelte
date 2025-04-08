<script lang="ts">
	import type { Scene } from "phaser";
	import type { Game } from "../../game/scenes/Game";
	import PhaserGame, { type TPhaserRef } from "../../game/PhaserGame.svelte";

	// The sprite can only be moved in the MainMenu Scene
	let canMoveSprite = false;

	//  References to the PhaserGame component (game and scene are exposed)
	let phaserRef: TPhaserRef = { game: null, scene: null};
	const spritePosition = { x: 0, y: 0 };

	const changeScene = () => {

		const scene = phaserRef.scene as Game;

		if (scene)
		{

			// Call the changeScene method defined in the `MainMenu`, `Game` and `GameOver` Scenes
			scene.changeScene();

		}

	}

	const moveSprite = () => {

		const scene = phaserRef.scene as Game;

		if (scene)
		{

			// Get the update logo position
			(scene as Game).moveLogo(({ x, y }) => {

				spritePosition.x = x;
				spritePosition.y = y;

			});

		}

	}

	const addSprite = () => {

		const scene = phaserRef.scene as Scene;

		if (scene)
		{

			// Add more stars
			const x = Phaser.Math.Between(64, scene.scale.width - 64);
			const y = Phaser.Math.Between(64, scene.scale.height - 64);

			//  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
			const star = scene.add.sprite(x, y, 'star');

			//  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
			//  You could, of course, do this from within the Phaser Scene code, but this is just an example
			//  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
			scene.add.tween({
				targets: star,
				duration: 500 + Math.random() * 1000,
				alpha: 0,
				yoyo: true,
				repeat: -1
			});

		}

	}

	// Event emitted from the PhaserGame component
	const currentScene = (scene: Scene) => {

		canMoveSprite = (scene.scene.key !== "MainMenu");

	}

</script>

<div id="app">
	<PhaserGame bind:phaserRef={phaserRef} currentActiveScene={currentScene} />
	<div>
		<div>
			<button class="button" on:click={changeScene}>Change Scene</button>
		</div>
		<div>
			<button class="button" disabled={canMoveSprite} on:click={moveSprite}>Toggle Movement</button>
		</div>
		<div class="spritePosition">
			Sprite Position:
			<pre>{JSON.stringify(spritePosition, null, 2)}</pre>
		</div>
		<div>
			<button class="button" on:click={addSprite}>Add New Sprite</button>
		</div>
	</div>
</div>
