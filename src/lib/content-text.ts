/**
 * Helpers for the inline text conventions used in src/content (see
 * src/content/README.md):
 *
 * - `==word==`   highlighted word(s), rendered as <mark> (or the squiggle on the
 *                home hero)
 * - `\n`         line break (<br>)
 * - `[text](href)`, `*em*`, `**strong**`  inline markdown in string fields
 */

export type TextPart = { text: string; mark: boolean };

/** Split a heading into plain and highlighted parts. */
export function splitHighlight(input: string): TextPart[] {
    return input
        .split(/(==[^=]+==)/g)
        .filter(Boolean)
        .map(part =>
            part.startsWith('==') && part.endsWith('==')
                ? { text: part.slice(2, -2), mark: true }
                : { text: part, mark: false },
        );
}

/** Remove highlight markers, e.g. for <title> or aria-labels. */
export function plainText(input: string): string {
    return input.replace(/[=]=([^=]+)==/g, '$1').replace(/\n/g, ' ');
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Render a content string to HTML: escapes, then applies ==mark==, links,
 * **strong**, *em* and \n line breaks. Use with `set:html`.
 */
export function inlineHtml(input: string, markTag = 'mark'): string {
    return escapeHtml(input)
        .replace(/[=]=([^=]+)==/g, `<${markTag}>$1</${markTag}>`)
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}
