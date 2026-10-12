import type { APIRoute } from 'astro';
import { field, isBot, sendNotification, thanks } from '@/lib/forms';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const form = await request.formData();
    if (isBot(form)) return thanks(request);

    const name = field(form, 'name');
    const email = field(form, 'email');
    const topic = field(form, 'topic') || 'General enquiry';
    const message = field(form, 'message');

    if (!name || !email) {
        return new Response('Missing required fields', { status: 400 });
    }

    const failed = await sendNotification({
        subject: `${topic}: ${name}`,
        replyTo: email,
        text: `Topic: ${topic}\nName: ${name}\nEmail: ${email}\n\n${message}`,
    });
    return failed ?? thanks(request);
};
