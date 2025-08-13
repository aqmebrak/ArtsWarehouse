import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const CORRECT_PASSWORD = 'sbt2023'; // Store this in environment variables in production

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { password } = await request.json();

		if (!password) {
			return json({ success: false, message: 'Password is required' }, { status: 400 });
		}

		const isValid = password === CORRECT_PASSWORD;

		return json({
			success: isValid,
			message: isValid ? 'Password correct' : 'Invalid password'
		});
	} catch {
		return json({ success: false, message: 'Invalid request' }, { status: 400 });
	}
};
