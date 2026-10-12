import type { CollectionEntry } from 'astro:content';

/** A named section from a `pages` or `programs` entry (same schema). */
export type ContentSection =
    CollectionEntry<'pages'>['data']['sections'][string];
export type ContentCta = NonNullable<ContentSection['ctas']>[number];
export type Offering = CollectionEntry<'offerings'>;
export type Person = CollectionEntry<'people'>;
