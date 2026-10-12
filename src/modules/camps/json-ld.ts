import type { CollectionEntry } from 'astro:content';
import { site } from '@/data/site';

function isoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

/** schema.org Event objects for the holiday camps. */
export function campEvents(
    camps: CollectionEntry<'camps'>[],
): Record<string, unknown>[] {
    return camps.map(({ data, body }) => ({
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: data.eventName,
        description: body?.trim().replace(/\s+/g, ' '),
        startDate: isoDate(data.startDate),
        endDate: isoDate(data.endDate),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        image: new URL(data.image.src, site.url).href,
        location: {
            '@type': 'Place',
            name: data.eventLocation,
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'Adelaide',
                addressRegion: 'SA',
                addressCountry: 'AU',
            },
        },
        organizer: {
            '@type': 'Organization',
            name: site.name,
            url: site.url,
        },
        offers: {
            '@type': 'Offer',
            price: data.priceValue,
            priceCurrency: 'AUD',
            url: data.bookingUrl,
            availability: 'https://schema.org/InStock',
        },
    }));
}
