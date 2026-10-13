import { env } from 'cloudflare:workers';

export function field(form: FormData, name: string): string {
    const value = form.get(name);
    return typeof value === 'string' ? value.trim() : '';
}

/** Filled honeypot means a bot: pretend success without sending. */
export function isBot(form: FormData): boolean {
    return field(form, 'bot') !== '';
}

/** No-JS success: back to the page the form was on. */
function backToForm(request: Request): Response {
    const referer = request.headers.get('Referer');
    const back = new URL(referer ?? '/', request.url);
    // Never bounce to another site.
    const target =
        back.origin === new URL(request.url).origin ? back : new URL('/', request.url);
    return Response.redirect(target, 303);
}

/**
 * Replies to a form post. Forms sent by `form-submit.ts` ask for JSON and
 * show the message inline; plain (no-JS) posts go back to the page, or get
 * the error as text.
 */
export function formResponse(
    request: Request,
    result: { ok: boolean; message: string; status?: number | undefined },
): Response {
    const status = result.status ?? (result.ok ? 200 : 400);
    if (request.headers.get('Accept')?.includes('application/json')) {
        return Response.json(
            { ok: result.ok, message: result.message },
            { status },
        );
    }
    return result.ok
        ? backToForm(request)
        : new Response(result.message, { status });
}

/** Sends a form notification through the Cloudflare Email binding. */
export async function sendNotification(email: {
    subject: string;
    replyTo: string;
    text: string;
}): Promise<boolean> {
    try {
        await env.EMAIL.send({
            from: { email: env.CONTACT_FROM_EMAIL, name: 'Pelican website' },
            to: env.CONTACT_TO_EMAIL,
            ...email,
        });
    } catch (error) {
        console.error('Form email failed', error);
        return false;
    }
    return true;
}
