import type { CollectionEntry } from 'astro:content';

/** A named section from a `pages` or `hire` entry (same schema). */
export type HireSection = CollectionEntry<'hire'>['data']['sections'][string];
export type HireItem = NonNullable<HireSection['items']>[number];
export type Fact = NonNullable<HireSection['facts']>[number];
