import type { APIRoute } from 'astro';
import { z } from 'astro/zod';
import { isBot, thanks } from '@/lib/forms';
import { subscribe } from '@/lib/mailchimp';
import { verifyTurnstile } from '@/lib/turnstile';

export const prerender = false;

const Signup = z.object({
    email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
    /** Only the popup asks for a first name. */
    name: z.string().trim().max(100).optional(),
});

export const POST: APIRoute = async ({ request }) => {
    const form = await request.formData();
    if (isBot(form)) return thanks(request);

    if (!(await verifyTurnstile(form, request))) {
        return new Response(
            'Please complete the security check and try again',
            { status: 400 },
        );
    }

    const signup = Signup.safeParse(Object.fromEntries(form));
    if (!signup.success) {
        return new Response('Please enter a valid email address', {
            status: 400,
        });
    }

    const result = await subscribe({
        email: signup.data.email,
        firstName: signup.data.name || undefined,
    });
    if (result === 'rejected') {
        return new Response(
            'Mailchimp could not add that email address. Please check it and try again.',
            { status: 400 },
        );
    }
    if (result === 'failed') {
        return new Response('Could not sign you up right now', {
            status: 502,
        });
    }
    return thanks(request);
};
