import type { APIRoute } from 'astro';
import { field, formResponse, isBot, sendNotification } from '@/lib/forms';
import { verifyTurnstile } from '@/lib/turnstile';

export const prerender = false;

const SENT = 'Thanks, we have your message and will be in touch soon.';

export const POST: APIRoute = async ({ request }) => {
    const form = await request.formData();
    if (isBot(form)) return formResponse(request, { ok: true, message: SENT });

    if (!(await verifyTurnstile(form, request))) {
        return formResponse(request, {
            ok: false,
            message: 'Please complete the security check and try again.',
        });
    }

    const name = field(form, 'name');
    const email = field(form, 'email');
    const topic = field(form, 'topic') || 'General enquiry';
    const message = field(form, 'message');

    if (!name || !email) {
        return formResponse(request, {
            ok: false,
            message: 'Please add your name and email address.',
        });
    }

    const sent = await sendNotification({
        subject: `${topic}: ${name}`,
        replyTo: email,
        text: `Topic: ${topic}\nName: ${name}\nEmail: ${email}\n\n${message}`,
    });
    return formResponse(
        request,
        sent
            ? { ok: true, message: SENT }
            : {
                  ok: false,
                  status: 502,
                  message:
                      'Sorry, your message could not be sent. Please try again, or email ahoy@pelicanproductions.com.au.',
              },
    );
};
