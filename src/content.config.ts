import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/*
 * Content collections for the v56 redesign. See src/content/README.md for the
 * text conventions (==highlight== marks, inline [links](/href) and *em*).
 */

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

/** Path under /public (e.g. "/images/stage/x.webp") or an absolute URL. */
const src = z.string().regex(/^(\/|https?:\/\/)/, 'Must be /path or URL');

const image = z.object({
    src,
    /** Empty string = decorative. */
    alt: z.string(),
    /** CSS object-position, e.g. "50% 30%". */
    position: z.string().optional(),
    caption: z.string().optional(),
    /** Mosaic tile shape from the HTML (t/w/p/l classes). */
    shape: z.enum(['tall', 'wide', 'portrait', 'landscape']).optional(),
    width: z.number().int().optional(),
    height: z.number().int().optional(),
});

const cta = z.object({
    label: z.string(),
    href: z.string(),
    variant: z.enum(['primary', 'ghost']).default('primary'),
});

/** <dl class="facts|panel"> row. `value` may contain "\n" for <br>. */
const fact = z.object({ label: z.string(), value: z.string() });

const link = z.object({
    label: z.string(),
    href: z.string(),
    note: z.string().optional(),
});

/** Generic repeated thing inside a section (cards, steps, stats, stamps…). */
const item = z.object({
    id: z.string().optional(),
    kicker: z.string().optional(),
    number: z.string().optional(),
    title: z.string().optional(),
    text: z.string().optional(),
    value: z.string().optional(),
    label: z.string().optional(),
    when: z.string().optional(),
    tag: z.string().optional(),
    href: z.string().optional(),
    cta: cta.optional(),
    image: image.optional(),
    list: z.array(z.string()).optional(),
    links: z.array(link).optional(),
    facts: z.array(fact).optional(),
    pro: z.boolean().optional(),
});

/** Named page section. Every field optional; pages pick what they need. */
const section = z.object({
    /** Anchor id from the HTML (e.g. "finder", "faq", "royal-show"). */
    id: z.string().optional(),
    kicker: z.string().optional(),
    heading: z.string().optional(),
    lead: z.string().optional(),
    body: z.array(z.string()).optional(),
    note: z.string().optional(),
    facts: z.array(fact).optional(),
    ctas: z.array(cta).optional(),
    image: image.optional(),
    images: z.array(image).optional(),
    gallery: reference('galleries').optional(),
    items: z.array(item).optional(),
    list: z.array(z.string()).optional(),
    quote: z
        .object({ text: z.string(), cite: z.string().optional() })
        .optional(),
});

const hero = z.object({
    heading: z.string(),
    text: z.string().optional(),
    ctas: z.array(cta).default([]),
    image: image.optional(),
    sticker: z.object({ label: z.string(), value: z.string() }).optional(),
});

/** SEO fields shared by every routed entry. */
const seo = {
    /** Full <title>. */
    title: z.string(),
    description: z.string(),
    ogImage: src.default('/images/share.jpg'),
    noindex: z.boolean().default(false),
};

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

/** One entry per top-level route: SEO, hero and named sections. */
const pages = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
    schema: z.object({
        ...seo,
        /** Route path, e.g. "/camps/photos/". */
        path: z.string(),
        hero,
        sections: z.record(z.string(), section).default({}),
    }),
});

/** Every enrollable thing. Feeds the class finder, comparison table, cards. */
const offerings = defineCollection({
    loader: file('src/content/offerings.yaml'),
    schema: z.object({
        /** Name as shown on finder result cards. */
        name: z.string(),
        kind: z.enum(['class', 'camp', 'musical', 'pro', 'choir']),
        href: z.string(),
        /** Finder card description. */
        summary: z.string(),
        /** Finder card price line. */
        price: z.string(),
        /** Age-group card on the program page (.grp). */
        group: z
            .object({
                ages: z.string(),
                name: z.string(),
                duration: z.string(),
                schedule: z.string(),
            })
            .optional(),
        /** Row in the "Which class is right for me?" table. */
        table: z
            .object({
                name: z.string(),
                who: z.string(),
                when: z.string(),
                length: z.string(),
                cost: z.string(),
            })
            .optional(),
        order: z.number(),
    }),
});

const finderAge = z.enum(['foundation', '7-11', '12-17', '18-plus']);
const finderInterest = z.enum([
    'sing',
    'act',
    'dance',
    'all',
    'shows',
    'camps',
]);

/** "Find my class" quiz: options plus ordered matches per age × interest. */
const finder = defineCollection({
    loader: file('src/content/finder.yaml'),
    schema: z.object({
        heading: z.string(),
        lead: z.string(),
        ageQuestion: z.string(),
        ages: z.array(z.object({ id: finderAge, label: z.string() })),
        interestQuestion: z.string(),
        interests: z.array(z.object({ id: finderInterest, label: z.string() })),
        resultsHeading: z.string(),
        /** Shown when a combination has no matches. */
        emptyMessage: z.string(),
        cardCta: z.string(),
        ctas: z.array(cta),
        matches: z.array(
            z.object({
                age: finderAge,
                interest: finderInterest,
                offerings: z.array(reference('offerings')),
            }),
        ),
    }),
});

/** /programs/[slug]/ detail pages. */
const programs = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/programs' }),
    schema: z.object({
        ...seo,
        name: z.string(),
        hero,
        /** Age-group cards, in order. */
        offerings: z.array(reference('offerings')).default([]),
        teachers: z.array(reference('people')).default([]),
        sections: z.record(z.string(), section).default({}),
        order: z.number(),
    }),
});

/** Directors, singing teachers, faculty. Markdown body = teacher-page bullets. */
const people = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/people' }),
    schema: z.object({
        name: z.string(),
        roles: z.array(z.enum(['director', 'teacher', 'faculty'])).min(1),
        image: image,
        /** About-page bio (directors). */
        director: z
            .object({
                kicker: z.string(),
                quals: z.string(),
                bio: z.array(z.string()),
            })
            .optional(),
        /** Teacher card + /programs/singing-lessons/[id]/ page. */
        teacher: z
            .object({
                title: z.string(),
                description: z.string(),
                lead: z.string(),
                quals: z.string(),
            })
            .optional(),
        order: z.number(),
    }),
});

/** Pelican musicals and Pelican Professional shows. */
const productions = defineCollection({
    loader: glob({ pattern: '**/*.yaml', base: './src/content/productions' }),
    schema: z.object({
        title: z.string(),
        year: z.number().int(),
        company: z.enum(['pelican', 'professional']),
        status: z.enum(['past', 'upcoming']).default('past'),
        /** Poster card (musicals past grid). */
        poster: z
            .object({
                image: image.optional(),
                colors: z.tuple([z.string(), z.string()]),
                credit: z.string().default('Pelican Productions'),
            })
            .optional(),
        /** Professional shows: card summary, section heading and lead. */
        summary: z.string().optional(),
        heading: z.string().optional(),
        lead: z.string().optional(),
        anchor: z.string().optional(),
        photos: z.array(image).default([]),
        order: z.number(),
    }),
});

/** Holiday camps. Body = camp description. */
const camps = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/camps' }),
    schema: z.object({
        name: z.string(),
        offering: reference('offerings'),
        eventName: z.string(),
        dates: z.string(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
        ages: z.string(),
        price: z.string(),
        priceValue: z.number(),
        location: z.string(),
        eventLocation: z.string(),
        bookingUrl: z.url(),
        image: image,
        order: z.number(),
    }),
});

/** Tours and festival trips. Body = longer copy where the HTML has it. */
const trips = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/trips' }),
    schema: z.object({
        title: z.string(),
        status: z.enum(['upcoming', 'past', 'planned']),
        /** "Where we've been" story card. */
        story: z.object({ title: z.string(), text: z.string() }).optional(),
        heading: z.string().optional(),
        kicker: z.string().optional(),
        lead: z.string().optional(),
        body: z.array(z.string()).optional(),
        dates: z.object({ depart: z.string(), return: z.string() }).optional(),
        destinations: z.array(z.string()).optional(),
        route: z
            .array(z.object({ code: z.string(), place: z.string() }))
            .optional(),
        facts: z.array(fact).optional(),
        /** Boarding-pass graphic: header label plus the tear-off stub. */
        pass: z
            .object({
                label: z.string(),
                stub: z.object({
                    label: z.string(),
                    value: z.string(),
                    text: z.string(),
                }),
            })
            .optional(),
        stops: z.array(item).optional(),
        stopsNote: z.string().optional(),
        image: image.optional(),
        photos: z.array(image).default([]),
        ctas: z.array(cta).default([]),
        order: z.number(),
    }),
});

/** /hire/[slug]/ pages. */
const hire = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/hire' }),
    schema: z.object({
        ...seo,
        name: z.string(),
        hero,
        /** Contact form topic preselected in the enquiry form. */
        enquiryTopic: z.string(),
        sections: z.record(z.string(), section).default({}),
        order: z.number(),
    }),
});

const testimonials = defineCollection({
    loader: file('src/content/testimonials.yaml'),
    schema: z.object({
        quote: z.string(),
        cite: z.string(),
        /** Page ids (pages collection) that show this quote. */
        pages: z.array(z.string()).min(1),
        order: z.number(),
    }),
});

const keyDates = defineCollection({
    loader: file('src/content/key-dates.yaml'),
    schema: z.object({
        /** Big date label, e.g. "9–18 Oct" or "Now". */
        when: z.string(),
        /** Small label under it, e.g. "2026" or "Book". */
        sub: z.string(),
        title: z.string(),
        text: z.string().optional(),
        status: z.string().optional(),
        href: z.string().optional(),
        /** Which list(s) the date belongs to. */
        lists: z
            .array(z.enum(['home', 'cert-iv-auditions', 'diploma-auditions']))
            .min(1),
        order: z.number(),
    }),
});

const announcements = defineCollection({
    loader: file('src/content/announcements.yaml'),
    schema: z.object({
        text: z.string(),
        /** Alternate (white) ticker style. */
        alt: z.boolean().default(false),
        order: z.number(),
    }),
});

/** Body = answer (markdown, may contain links). */
const faqs = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/faqs' }),
    schema: z.object({
        question: z.string(),
        topic: z.enum(['classes', 'camps']),
        order: z.number(),
    }),
});

const galleries = defineCollection({
    loader: glob({ pattern: '**/*.yaml', base: './src/content/galleries' }),
    schema: z.object({
        title: z.string(),
        images: z.array(image).min(1),
    }),
});

export const collections = {
    pages,
    offerings,
    finder,
    programs,
    people,
    productions,
    camps,
    trips,
    hire,
    testimonials,
    keyDates,
    announcements,
    faqs,
    galleries,
};
