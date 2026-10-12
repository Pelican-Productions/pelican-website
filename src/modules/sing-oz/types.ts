import type { CollectionEntry } from 'astro:content';

/** A named section from a `pages` entry. */
export type PageSection = CollectionEntry<'pages'>['data']['sections'][string];
export type SectionItem = NonNullable<PageSection['items']>[number];
export type Fact = NonNullable<PageSection['facts']>[number];
