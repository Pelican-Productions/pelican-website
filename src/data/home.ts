export const homeMeta = {
    title: 'Pelican Productions',
    description:
        'Classes, camps and full-scale musicals for young performers across South Australia. Professional tutors, a proper stage, and a flock that cheers loudest for each other.',
};

const UPLOADS =
    'https://www.pelicanproductions.com.au/uploads/3/9/5/6/39560363';

export const homeImages = {
    nestBanner: `${UPLOADS}/thenest-banner_orig.jpg`,
    mtcPerformance: `${UPLOADS}/mtc-2023_orig.jpg`,
    mtcCast: `${UPLOADS}/mtc-2023-2_orig.jpg`,
    inTheHeights: `${UPLOADS}/ith-5_orig.jpg`,
    musicalProduction: `${UPLOADS}/5963801.jpg`,
    sportsVouchers: `${UPLOADS}/sports-vouchers-plus-1920x400-banner-generic_orig.jpg`,
};

export const stats = [
    { label: 'Making theatre since', value: '2004', variant: 'teal' as const },
    {
        label: 'Full-scale musicals staged',
        value: '20+',
        variant: 'teal' as const,
    },
    {
        label: 'Performer age range',
        value: '7–19',
        variant: 'teal' as const,
    },
    {
        label: 'Alumni on stage in',
        value: 'West End · Broadway tours · Opera Australia',
        variant: 'violet' as const,
    },
];

export const sportsVoucherFormUrl =
    'https://www.sportsvouchers.sa.gov.au/2026-Sports-Voucher-Plus-Voucher-Form.pdf';
