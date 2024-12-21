import { writable } from 'svelte/store';
import images from '$lib/images';

export const modals = writable(Object.fromEntries(images.map((img) => [img, false])));
