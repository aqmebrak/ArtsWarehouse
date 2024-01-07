<script lang="ts">
	import P5 from 'p5-svelte';
	import type { Sketch } from 'p5-svelte';

	let directionUp = true;
	let startTime = 0;

	const sketch: Sketch = (p5) => {
		const canvaH = window.innerHeight - (window.innerHeight * 0.2);
		const canvaW = window.innerWidth - (window.innerWidth * 0.5);
		const circleWidth = 50
		const circleHalfWidth = circleWidth /2;

		p5.setup = () => {
			p5.createCanvas(canvaW, canvaH);
			p5.noStroke();
			p5.fill('#ed225d');
			p5.background('#ebd7ef');
			startTime = p5.millis(); // Record the start time
		};

		p5.draw = () => {
			p5.background('#ebd7ef');
			let elapsedTime = p5.millis() - startTime;
			let initialPosY = directionUp ? (p5.height - circleHalfWidth) : circleHalfWidth;

			// let offset = directionUp ? -(t * offsetY) : (t * offsetY);
			if (elapsedTime >= 5000) {
				directionUp = !directionUp;
				startTime = p5.millis();
			}

			let bubbleX = p5.width / 2;
			let bubbleY = initialPosY - ((p5.height - circleWidth ) * (elapsedTime / 5000)) * (directionUp ? 1 : -1); // 5000 milliseconds;
			p5.ellipse(bubbleX, bubbleY, circleWidth, circleWidth);
		};
	};
</script>

<div class="flex flex-col justify-center items-center">
	<P5 {sketch} />
</div>