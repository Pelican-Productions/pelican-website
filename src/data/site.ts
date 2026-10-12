/**
 * Site-wide constants: identity, contact, nav tree and footer content.
 * Copied from the v56 static design (pelican-netlify-v56-40).
 */

export interface NavLink {
    label: string;
    href: string;
}

export interface NavItem extends NavLink {
    /** Section key used to mark the top-level item active (BaseLayout `active`). */
    key: string;
    children?: NavLink[];
}

export interface SocialLink {
    name: 'Facebook' | 'Instagram' | 'TikTok';
    href: string;
    handle: string;
}

export const site = {
    name: 'Pelican Productions',
    shortName: 'Pelican',
    url: 'https://www.pelicanproductions.com.au',
    description:
        'Musical theatre, acting, dance and singing classes, holiday camps and productions for young performers in Adelaide, South Australia.',
    email: 'ahoy@pelicanproductions.com.au',
    enquiryHref: 'mailto:ahoy@pelicanproductions.com.au?subject=Enquiry',
    enrolUrl: 'https://dancestudio-pro.com/online/pelicanproductions',
    themeColor: '#070a1f',
    locale: 'en_AU',
    lang: 'en-AU',
    shareImage: '/images/share.jpg',
    logo: '/images/logo-light.svg',
    venue: 'The Nest Studios',
    address: {
        streetAddress: '57A Price Avenue',
        addressLocality: 'Lower Mitcham',
        addressRegion: 'SA',
        addressCountry: 'AU',
    },
} as const;

/**
 * The flat Pelican mark, back to front. All share one 260x244 viewBox so they
 * stack in the same box (Logo, PageHero).
 */
export const pelicanLayers = [
    '/images/brand/wing-pale.svg',
    '/images/brand/wing-pale-beak.svg',
    '/images/brand/wing-red.svg',
    '/images/brand/wing-blue.svg',
    '/images/brand/body.svg',
    '/images/brand/tail.svg',
    '/images/brand/beak.svg',
    '/images/brand/eye.svg',
];

export const socials: SocialLink[] = [
    {
        name: 'Facebook',
        href: 'https://www.facebook.com/PelicanProductionsSA/',
        handle: 'PelicanProductionsSA',
    },
    {
        name: 'Instagram',
        href: 'https://www.instagram.com/pelicanproductions/',
        handle: '@pelicanproductions',
    },
    {
        name: 'TikTok',
        href: 'https://www.tiktok.com/@pelicanproductions',
        handle: '@pelicanproductions',
    },
];

export const nav: NavItem[] = [
    {
        key: 'classes',
        label: 'Classes',
        href: '/programs/',
        children: [
            { label: 'Weekly Classes', href: '/programs/' },
            { label: 'Find my class', href: '/programs/#finder' },
            { label: 'Musical Theatre', href: '/programs/musical-theatre/' },
            { label: 'Acting', href: '/programs/acting/' },
            { label: 'Dance', href: '/programs/dance/' },
            { label: 'Singing Lessons', href: '/programs/singing-lessons/' },
        ],
    },
    { key: 'courses', label: 'Courses', href: '/courses/' },
    {
        key: 'camps',
        label: 'Camps & Trips',
        href: '/camps/',
        children: [
            { label: 'Holiday Camps', href: '/camps/' },
            { label: 'Camp Photos', href: '/camps/photos/' },
            { label: 'Trips & Tours', href: '/trips/' },
        ],
    },
    {
        key: 'shows',
        label: 'Shows',
        href: '/musicals/',
        children: [
            { label: 'Current & Upcoming', href: '/musicals/#coming' },
            { label: 'Junior & Senior Musicals', href: '/musicals/#programs' },
            { label: 'Past Productions', href: '/musicals/#past' },
            { label: 'Professional', href: '/professional/' },
        ],
    },
    { key: 'singoz', label: 'Sing!OZ', href: '/sing-oz/' },
    {
        key: 'hire',
        label: 'Hire',
        href: '/hire/',
        children: [
            { label: 'Hire overview', href: '/hire/' },
            { label: 'Studio Hire', href: '/hire/studio-hire/' },
            {
                label: 'Set & Costume Hire',
                href: '/hire/set-and-costume-hire/',
            },
        ],
    },
    {
        key: 'about',
        label: 'About',
        href: '/about/',
        children: [
            { label: 'About Pelican', href: '/about/' },
            { label: 'Contact', href: '/contact/' },
        ],
    },
];

export type NavKey = (typeof nav)[number]['key'];

/** Work out which top-level nav item a path belongs to. */
export function navKeyForPath(pathname: string): string | undefined {
    const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
    const extra: Record<string, string> = {
        '/find-my-class/': 'classes',
        '/trips/': 'camps',
        '/professional/': 'shows',
        '/contact/': 'about',
    };
    for (const [prefix, key] of Object.entries(extra)) {
        if (path.startsWith(prefix)) return key;
    }
    return nav.find(item => item.href !== '/' && path.startsWith(item.href))
        ?.key;
}

export const footer = {
    visit: {
        heading: 'Visit',
        lines: [site.venue, site.address.streetAddress, 'Lower Mitcham SA'],
    },
    contact: {
        heading: 'Contact',
        items: [
            { label: site.email, href: site.enquiryHref },
            { label: 'Enrol now', href: site.enrolUrl, external: true },
            { label: 'Sports Vouchers Plus accepted' },
        ] as { label: string; href?: string; external?: boolean }[],
    },
    follow: {
        heading: 'Follow',
    },
    credits:
        'Photography: Oliver Toth (Accent Photography), Jen Frith and Kylie Green.',
} as const;

export const newsletter = {
    heading: 'Don’t miss a beat.',
    headingAccent: 'Stay in the loop.',
    placeholder: 'Your email address',
    button: 'Stay in the loop',
    action: '/api/newsletter',
    /** Timed "Join our mailing list" modal (NewsletterPopup). */
    popup: {
        heading: 'Join our mailing list',
        text: 'Be first to hear about auditions, camp bookings and new classes.',
        button: 'Keep me posted',
    },
} as const;
