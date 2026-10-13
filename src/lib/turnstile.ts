import { env } from 'cloudflare:workers';

/** Cloudflare's always-pass test secret, used by `astro dev`. */
const TEST_SECRET = '1x0000000000000000000000000000000AA';

/** Form field the Turnstile widget writes its token into. */
export const TURNSTILE_FIELD = 'cf-turnstile-response';

/** Checks a Turnstile token with Cloudflare (siteverify). */
export async function verifyTurnstile(
    form: FormData,
    request: Request,
): Promise<boolean> {
    const token = form.get(TURNSTILE_FIELD);
    if (typeof token !== 'string' || !token) return false;

    const secret = import.meta.env.DEV ? TEST_SECRET : env.TURNSTILE_SECRET_KEY;
    if (!secret) {
        console.error('Turnstile: TURNSTILE_SECRET_KEY is not set');
        return false;
    }

    const body = new FormData();
    body.append('secret', secret);
    body.append('response', token);
    const ip = request.headers.get('CF-Connecting-IP');
    if (ip) body.append('remoteip', ip);

    try {
        const response = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            { method: 'POST', body },
        );
        const result = (await response.json()) as { success?: boolean };
        return result.success === true;
    } catch (error) {
        console.error('Turnstile verify failed', error);
        return false;
    }
}
