import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge needs to know about the custom @theme tokens in
 * src/styles/global.css, otherwise e.g. `text-lead` (a font size) is treated
 * as a colour and dropped when merged with `text-white`.
 */
const twMerge = extendTailwindMerge({
    extend: {
        theme: {
            text: ['hero', 'h2', 'lead', 'quote'],
            shadow: [
                'hard',
                'hard-glow',
                'soft',
                'lift',
                'drop',
                'float',
                'pop',
            ],
            radius: ['btn', 'card'],
            tracking: ['tightish', 'kicker', 'nav'],
            container: ['wrap', 'lead'],
            breakpoint: ['nav'],
        },
    },
});

export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}
