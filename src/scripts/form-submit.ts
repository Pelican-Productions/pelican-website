/**
 * Sends `[data-form]` forms with fetch: spinner on the submit button, then the
 * server's message inline. Without JS the same forms post normally (and land
 * back on the page). Handling the submit first stops ClientRouter navigating.
 */

export {};

const FALLBACK = 'Something went wrong. Please try again.';
const OFFLINE = 'We couldn’t reach the server. Check your connection and try again.';

interface Reply {
    ok: boolean;
    message: string;
}

/** The form's live region, created once so screen readers announce updates. */
function statusFor(form: HTMLFormElement): HTMLElement {
    let el = form.querySelector<HTMLElement>('[data-form-status]');
    if (!el) {
        el = document.createElement('p');
        el.className = 'form-status';
        el.dataset.formStatus = '';
        el.setAttribute('role', 'status');
        form.appendChild(el);
    }
    return el;
}

async function send(form: HTMLFormElement): Promise<Reply> {
    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' },
        });
        const data = (await response.json().catch(() => null)) as
            | Partial<Reply>
            | null;
        if (typeof data?.message !== 'string') {
            return { ok: false, message: FALLBACK };
        }
        return { ok: response.ok && data.ok === true, message: data.message };
    } catch {
        return { ok: false, message: OFFLINE };
    }
}

/** Turnstile tokens are single use: get a fresh one after every attempt. */
function resetTurnstile(form: HTMLFormElement): void {
    for (const el of form.querySelectorAll<HTMLElement>('[data-widget-id]')) {
        window.turnstile?.reset(el.dataset.widgetId ?? '');
    }
}

async function onSubmit(event: SubmitEvent): Promise<void> {
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;
    event.preventDefault();
    if (form.getAttribute('aria-busy') === 'true') return;

    const button = form.querySelector<HTMLButtonElement>('[type="submit"]');
    const status = statusFor(form);
    form.setAttribute('aria-busy', 'true');
    button?.setAttribute('aria-disabled', 'true');
    button?.setAttribute('data-loading', '');
    status.textContent = '';
    delete status.dataset.state;

    const reply = await send(form);

    form.removeAttribute('aria-busy');
    button?.removeAttribute('aria-disabled');
    button?.removeAttribute('data-loading');
    resetTurnstile(form);
    status.dataset.state = reply.ok ? 'success' : 'error';
    status.textContent = reply.message;

    if (reply.ok) {
        form.reset();
        form.dispatchEvent(new CustomEvent('form:success', { bubbles: true }));
    }
}

// ClientRouter swaps the body, so bind each new page's forms.
document.addEventListener('astro:page-load', () => {
    for (const form of document.querySelectorAll<HTMLFormElement>(
        'form[data-form]',
    )) {
        statusFor(form);
        form.addEventListener('submit', onSubmit);
    }
});
