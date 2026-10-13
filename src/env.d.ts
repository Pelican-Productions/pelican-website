
declare namespace NodeJS {
    interface ProcessEnv {
        readonly BUILDER_API_PUBLIC_KEY: string;
    }
}

declare namespace Cloudflare {
    interface Env {
        /** Worker secret (`wrangler secret put`). `astro dev` uses the test key. */
        readonly TURNSTILE_SECRET_KEY?: string;
    }
}

/** Cloudflare Turnstile (explicit render), loaded by Turnstile.astro. */
interface TurnstileApi {
    render: (el: HTMLElement, options: Record<string, string>) => string;
    reset: (id: string) => void;
    remove: (id: string) => void;
}

interface Window {
    turnstile?: TurnstileApi;
}
