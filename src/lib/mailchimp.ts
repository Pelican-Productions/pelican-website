import { env } from 'cloudflare:workers';

export type SubscribeResult = 'subscribed' | 'rejected' | 'failed';

interface MailchimpError {
    title?: string;
    detail?: string;
}

/**
 * Adds an email to the Mailchimp audience as "pending", so Mailchimp sends
 * its confirm-your-subscription email (double opt-in, like the old embed).
 * Someone already on the list counts as subscribed.
 */
export async function subscribe(member: {
    email: string;
    firstName?: string | undefined;
}): Promise<SubscribeResult> {
    const key = env.MAILCHIMP_API_KEY;
    if (!key) {
        console.error('Mailchimp: MAILCHIMP_API_KEY is not set');
        return 'failed';
    }
    // Keys end in their data centre, e.g. "…-us2".
    const dc = key.split('-').at(-1);
    const url = `https://${dc}.api.mailchimp.com/3.0/lists/${env.MAILCHIMP_LIST_ID}/members`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${btoa(`pelican:${key}`)}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email_address: member.email,
                status: 'pending',
                merge_fields: member.firstName
                    ? { FNAME: member.firstName }
                    : {},
            }),
        });
        if (response.ok) return 'subscribed';

        const error = (await response
            .json()
            .catch(() => ({}))) as MailchimpError;
        if (error.title === 'Member Exists') return 'subscribed';
        // Fake-looking or previously deleted addresses Mailchimp won't take.
        if (response.status === 400) {
            console.warn('Mailchimp rejected signup', error.title);
            return 'rejected';
        }
        console.error('Mailchimp signup failed', response.status, error);
    } catch (error) {
        console.error('Mailchimp signup failed', error);
    }
    return 'failed';
}
