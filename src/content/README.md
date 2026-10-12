# Content

All site copy lives here, and the schemas are in `src/content.config.ts`. Copy
was taken word for word from the v56 static site, with HTML entities decoded.

## Collections

| Collection      | Source               | What                                                                                  |
| --------------- | -------------------- | ------------------------------------------------------------------------------------- |
| `pages`         | `pages/*.md`         | Per-route SEO, hero and named `sections` (home, about, programs, camps, trips, ...)   |
| `offerings`     | `offerings.yaml`     | Every class/camp/musical/pro course: name, kind, href, summary, price, timetable rows |
| `finder`        | `finder.yaml`        | Class finder: questions, ages, interests, and age x interest -> offerings matches     |
| `programs`      | `programs/*.md`      | Program detail pages (`/programs/<id>/`), with refs to offerings and teachers         |
| `people`        | `people/*.md`        | Directors and teachers; body = bullet list of credits                                 |
| `productions`   | `productions/*.yaml` | Past/upcoming shows: posters, photos, status                                          |
| `camps`         | `camps/*.md`         | Music Theatre Camp and Spotlight: dates, price, booking, event (JSON-LD) data         |
| `trips`         | `trips/*.md`         | Tours (upcoming, planned, past) with stops, route, boarding pass, photos              |
| `hire`          | `hire/*.md`          | `/hire/<id>/` pages; `enquiryTopic` preselects the contact form topic                 |
| `testimonials`  | `testimonials.yaml`  | Quotes, filtered by `pages` (route ids they appear on)                                |
| `keyDates`      | `key-dates.yaml`     | Dates, filtered by `lists` (e.g. `home`, `cert-iv-auditions`)                         |
| `announcements` | `announcements.yaml` | Ticker messages                                                                       |
| `faqs`          | `faqs/<topic>/*.md`  | Question in frontmatter, answer in body; `topic` = `classes` or `camps`               |
| `galleries`     | `galleries/*.yaml`   | Named image sets, referenced from page sections via `gallery`                         |

## Text conventions (string fields)

- `==text==` marks highlighted words. They render as `<mark>`; on the home hero
  heading they render as the squiggle instead.
- `\n` is a line break (`<br>`).
- Inline markdown is allowed: `[text](href)`, `**strong**`, `*em*`.
- Placeholders:
    - `{name}`: the teacher name, used in the teacher enquiry link.
    - `{n}` / `{total}`: the page counter in the prospectus viewer.

`src/lib/content-text.ts` has helpers for these: `splitHighlight`, `plainText`
and `inlineHtml`.

## Notes

- The "From first class to professional stage" journey steps live only in
  `pages/home` (`sections.journey.items`). Other pages carry only the heading
  and lead.
- Images are paths under `public/`. External URLs are used only where the source
  site did the same.
