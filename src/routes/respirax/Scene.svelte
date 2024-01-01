<script lang="ts">
	import { AudioLoader, AudioAnalyser, Clock, Audio } from 'three';
	import { T, useTask, useLoader } from '@threlte/core';
	import { interactivity, AudioListener } from '@threlte/extras';
	import { spring } from 'svelte/motion';
	import song from '../../songs/aurora.mp3';
	import { spCode } from './spCode.js';
	import { createSculptureWithGeometry } from 'shader-park-core';
	import { onMount } from 'svelte';

	let player = {
		play: null,
		pause: null
	};
	let audioContext;
	// let audio;
	let isPlaying = false;

	const audioLoader = useLoader(AudioLoader);

	// $: console.log(audio);
	$: console.log(audioContext);
	$: console.log(audioLoader);


	onMount(() => {

		// instantiate audio object
		const oceanAmbientSound = new Audio(audioContext);

		console.log('audioLoader', audioLoader);
		audioLoader.load(song, (buffer) => {
			console.log('load');
			audio.setBuffer(buffer);
			audio.setLoop(true);
			audio.setVolume(0.5);
		});
		// create an AudioAnalyser, passing in the sound and desired fftSize
		// get the average frequency of the sound
		const analyser = new AudioAnalyser(audioContext, 32);
		console.log(analyser);
	})

	// // Create Shader Park Sculpture
	// let mesh = createSculptureWithGeometry(geometry, spCode(), () => ( {
	// 	time: state.time,
	// 	pointerDown: state.pointerDown,
	// 	audio: state.audio,
	// 	mouse: state.mouse,
	// 	_scale : .5
	// } ));


	interactivity();
	const scale = spring(1);
	let rotation = 0;

	// update every frame
	useTask((delta) => {
		rotation += delta;
	});

</script>

<T.PerspectiveCamera
	makeDefault
	position={[10, 10, 10]}
	on:create={({ ref }) => {
    ref.lookAt(0, 1, 0)
  }}
/>

<T.DirectionalLight
	position={[0, 10, 10]}
	castShadow
/>
<AudioListener id="audio" bind:audioContext />

<T.Mesh
	rotation.y={rotation}
	position.y={1}
	scale={$scale}
	on:pointerenter={() => scale.set(1.5)}
	on:pointerleave={() => scale.set(1)}
	castShadow
	on:click={() => {
		// play audio
		isPlaying ? player.pause(): player.play();
		isPlaying = !isPlaying
	}}
>
	<T.BoxGeometry args={[1, 2, 1]} />
	<T.MeshStandardMaterial color="hotpink" />
</T.Mesh>

<T.Mesh
	rotation.x={-Math.PI / 2}
	receiveShadow
>
	<T.CircleGeometry args={[4, 40]} />
	<T.MeshStandardMaterial color="white" />
</T.Mesh>

<!--<Audio id="audio"-->
<!--			 src="{song}"-->
<!--			 bind:play={player.play}-->
<!--			 bind:pause={player.pause}-->
<!--			 on:load={(audio) => {-->
<!--				 console.log('audioLoader', audioLoader);-->
<!--					audioLoader.load( song, (buffer) => {-->
<!--						console.log('load');-->
<!--						audio.setBuffer( buffer );-->
<!--						audio.setLoop(true);-->
<!--						audio.setVolume(0.5);-->
<!--					});-->
<!--					// create an AudioAnalyser, passing in the sound and desired fftSize-->
<!--					// get the average frequency of the sound-->
<!--					const analyser = new AudioAnalyser( audioContext, 32 );-->
<!--					console.log(analyser);-->
<!--				}-->
<!--			}-->
<!--/>-->
