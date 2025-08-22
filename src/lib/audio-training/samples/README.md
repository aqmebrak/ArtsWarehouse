# Audio Training Samples

This directory contains audio samples used for the EQ training exercise.

## Current Samples

1. `819268__fax_drummer__amen-break-174-bpm-detruit.wav` - Amen break drum sample
2. `819417__fax_drummer__drum-and-bass-break-179-bpm.wav` - Drum and bass break
3. `819463__fax_drummer__drum-and-bass-178-bpm-2.wav` - Another drum and bass break

## Usage

These samples are loaded randomly during the EQ exercise to provide realistic audio content for frequency identification training.

## Adding New Samples

To add new samples:

1. Place WAV files in this directory
2. Update the `sampleFiles` array in `/src/routes/audio-training/eq/+page.svelte`
3. Ensure samples are between 2-5 seconds long for optimal training experience

## Fallback

If samples fail to load, the system will generate fallback drum sounds programmatically.
