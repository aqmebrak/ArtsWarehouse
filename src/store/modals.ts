import { writable } from 'svelte/store';
import images from '$src/images';

export const modals = writable(Object.fromEntries(images.map((img) => [img, false])));
