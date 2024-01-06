<script lang="ts">
	import P5 from 'p5-svelte';
	import type { Sketch } from 'p5-svelte';

	let t = 0; // time variable
	let directionUp = true;
	const framerate = 30
	const frameSteps = 1 / framerate;

	const sketch: Sketch = (p5) => {
		const canvaH = window.innerHeight - (window.innerHeight * 0.2)
		const offsetY = (canvaH - 20) / framerate * 5;  // 5 seconds of framerate per sec;
		console.log(offsetY);

		p5.setup = () => {
			p5.createCanvas(window.innerWidth - (window.innerWidth * 0.1), canvaH);
			p5.noStroke();
			p5.fill('#ed225d');
			p5.background('#ebd7ef')
		};

		p5.draw = () => {
			p5.frameRate(framerate);
			p5.clear();
			p5.background('#ebd7ef')


			let offset = directionUp ? -(t * offsetY) : (t * offsetY);
			let initialPosY = directionUp ? p5.height - 40 : 40;
			if(t > 5) {
				directionUp = !directionUp;
				t = 0;
			}
			let bubbleX, bubbleY;
			bubbleX = p5.width / 2;
			bubbleY = initialPosY + offset;

			p5.ellipse(bubbleX, bubbleY, 40, 40);

			t = t + frameSteps; // update time
		};
	};
</script>

<div class="flex flex-col justify-center items-center">
	<P5 {sketch} />
</div>