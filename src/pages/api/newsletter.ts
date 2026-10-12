import type { APIRoute } from 'astro';
import { field, isBot, sendNotification, thanks } from '@/lib/forms';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const form = await request.formData();
    if (isBot(form)) return thanks(request);

    const name = field(form, 'name');
    const email = field(form, 'email');

    if (!email) {
        return new Response('Missing email address', { status: 400 });
    }

    const failed = await sendNotification({
        subject: `Newsletter sign-up: ${email}`,
        replyTo: email,
        text: `Add to the mailing list.\nName: ${name || '(not given)'}\nEmail: ${email}`,
    });
    return failed ?? thanks(request);
};
