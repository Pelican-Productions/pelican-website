import { env } from 'cloudflare:workers';

export function field(form: FormData, name: string): string {
    const value = form.get(name);
    return typeof value === 'string' ? value.trim() : '';
}

/** Filled honeypot means a bot: pretend success without sending. */
export function isBot(form: FormData): boolean {
    return field(form, 'bot') !== '';
}

export function thanks(request: Request): Response {
    return Response.redirect(new URL('/thanks/', request.url), 303);
}

/** Sends a form notification through the Cloudflare Email binding. */
export async function sendNotification(email: {
    subject: string;
    replyTo: string;
    text: string;
}): Promise<Response | null> {
    try {
        await env.EMAIL.send({
            from: { email: env.CONTACT_FROM_EMAIL, name: 'Pelican website' },
            to: env.CONTACT_TO_EMAIL,
            ...email,
        });
    } catch (error) {
        console.error('Form email failed', error);
        return new Response('Could not send message', { status: 502 });
    }
    return null;
}
