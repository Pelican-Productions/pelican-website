
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
