import type { APIRoute } from 'astro';
import { z } from 'astro/zod';
import { formResponse, isBot } from '@/lib/forms';
import { subscribe } from '@/lib/mailchimp';
import { verifyTurnstile } from '@/lib/turnstile';

export const prerender = false;

const Signup = z.object({
    email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
    /** Only the popup asks for a first name. */
    name: z.string().trim().max(100).optional(),
});

const SUBSCRIBED =
    'You’re in! Check your inbox to confirm your subscription.';

export const POST: APIRoute = async ({ request }) => {
    const form = await request.formData();
    if (isBot(form)) {
        return formResponse(request, { ok: true, message: SUBSCRIBED });
    }

    if (!(await verifyTurnstile(form, request))) {
        return formResponse(request, {
            ok: false,
            message: 'Please complete the security check and try again.',
        });
    }

    const signup = Signup.safeParse(Object.fromEntries(form));
    if (!signup.success) {
        return formResponse(request, {
            ok: false,
            message: 'Please enter a valid email address.',
        });
    }

    const result = await subscribe({
        email: signup.data.email,
        firstName: signup.data.name || undefined,
    });
    if (result === 'rejected') {
        return formResponse(request, {
            ok: false,
            message:
                'We couldn’t add that email address. Please check it and try again.',
        });
    }
    if (result === 'failed') {
        return formResponse(request, {
            ok: false,
            status: 502,
            message:
                'Sorry, we couldn’t sign you up right now. Please try again soon.',
        });
    }
    return formResponse(request, { ok: true, message: SUBSCRIBED });
};
