# RailDate

An independent Hindi/English train booking date calculator. No API, database, paid dependency or IRCTC credentials are needed. **Deployment is configured through GitHub Actions. Auto ads code is installed; Google site approval is still pending.**

## Included

- 60-day advance and AC/non-AC Tatkal opening calculations in IST.
- Train-origin adjustment for boarding on days 1–7, with explicit dates in the result.
- Input validation, past-opening status, UTC calendar event downloads with a 15-minute alert, and clipboard copy.
- 16 static routes: English/Hindi calculators, three guides, About, Contact, Privacy and Terms. Two 404 pages.
- Responsive layout, labelled form controls, keyboard focus, reduced-motion support, unique titles/descriptions, canonical and language-alternate URLs, sitemap, robots.txt, custom favicon and truthful structured data.
- Feature-detected WebMCP calculator action. Its runtime validation was unavailable; no dependency on it for the normal UI.
- GitHub Actions build, calculation checks and Pages deployment workflow.
- AdSense verification, root ads.txt, Auto ads integration and consent preference controls. Optional manual display units remain disabled.

## Free deployment

Source repository: `yashwant-verma/train-booking-date-calculator`. The repository is public, GitHub Pages uses the GitHub Actions publishing source, and HTTPS is enforced. The workflow builds with the actual Pages URL and publishes on pushes to `main`.

Website: https://yashwant-verma.github.io/train-booking-date-calculator/ . Brand: **RailDate — Train Booking Date Calculator**. The descriptive project path is part of the free `github.io` address, not a purchased custom domain.

This setup uses GitHub Free Pages and standard `ubuntu-latest` runners in the public repository. No paid plan, purchased domain, paid API, larger runner, database or billing upgrade is used. The free `github.io` address is the intended public address. GitHub's service limits still apply.

To redeploy manually, use **Actions → Build and deploy RailDate → Run workflow**. Wait for the build and deploy jobs to succeed before claiming an update is live.

GitHub Pages usage limits: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits . The site is a free informational utility; it has no checkout or paid SaaS. Before expanding it into an online business or paid service, use hosting that permits that use. GitHub can remain the source repository.

## Local build

Requires Python 3.10+ and Node 18+. No install step.

```sh
python3 scripts/build.py
npm test
```

The default build is deliberately **noindex**, with no canonical host, until a real deployment URL is supplied. To build production metadata on Bash:

```sh
SITE_URL=https://your-real-domain.example python3 scripts/build.py
```

Replace the example with the actual public URL. Project subpaths are supported. `dist/` is the public output. Do not double-click HTML to test module scripts; serve the folder through an HTTP static server in your own environment.

## AdSense and Search Console setup

On 21 September 2026 the authenticated AdSense dashboard confirmed:
- Site ownership verified; review requested; site status **Getting ready** (not approved).
- Payments information received and Auto ads already On.
- Google European regulations consent message Published, including Do not consent.
- Corrected that message's privacy URL to the HTTPS calculator Privacy page and set the displayed site name to RailDate; republished successfully.

The Auto ads tag for `ca-pub-1127445765148847` is installed on the root homepage and generated indexable pages. AdSense loads the published Google CMP through this tag. Footer privacy controls use the documented googlefc callback queue to reopen the consent message when available. No fake slot ID, custom CMP or private login email is used. Auto ads needs no individual ad slot. The legacy manual-unit path still requires its original safeguards.

The deployment defaults `AUTO_ADS_ENABLED` and `ADS_PRIVACY_READY` to true based on the observed published CMP. Installing the tag is allowed during review; it does not constitute approval or guarantee impressions. To disable this integration, set `AUTO_ADS_ENABLED=false` and leave `ADS_ENABLED` unset/false, rebuild, and remove the tag from the separate root homepage as well. Root authoritative ads.txt: https://yashwant-verma.github.io/ads.txt . Search Console status is recorded in the dated verification section below.

Set these **repository variables** in Settings → Secrets and variables → Actions → Variables, then rebuild:

| Variable | Purpose |
|---|---|
| `CONTACT_EMAIL` | Your public support email; publishes on Contact and Privacy. Currently these pages honestly link to the verified GitHub profile. |
| `GOOGLE_SITE_VERIFICATION` | The exact Search Console HTML-tag verification content value. |
| `ADSENSE_PUBLISHER_ID` | Real `ca-pub-` ID with 16 digits, from your AdSense account. Adds verification metadata and ads.txt, even while ads are off. |
| `ADSENSE_SLOT_ID` | Your responsive display-ad unit's numeric slot ID. |
| `AUTO_ADS_ENABLED` | Install the Auto ads tag; production defaults to true. Google approval still controls serving. |
| `ADS_ENABLED` | Optional manual display units. Keep off when using Auto ads alone. Requires slot, contact and consent configuration. |
| `ADS_PRIVACY_READY` | Production defaults to `true` after the published Google consent message was verified on 2026-09-21. Revisit when changing providers or consent settings. This is an operator attestation, not a consent implementation or Google certification. |

AdSense approval is a separate Google review. Do not enable ads with fake IDs. Review eligibility and policies: https://support.google.com/adsense/answer/9724 . For users in regions requiring a Google-certified CMP, configure an eligible solution such as the applicable Google Privacy & messaging flow before enabling ads. No custom substitute consent banner is included.

Official consent setup reference: https://support.google.com/adsense/answer/16918505?hl=en . Official ads.txt location reference: https://support.google.com/adsense/answer/9785052?hl=en .

The free GitHub Pages address is used; no domain purchase is part of this project. AdSense must independently approve the submitted site `yashwant-verma.github.io`. The authoritative host-root `ads.txt` is maintained in `yashwant-verma/yashwant-verma.github.io`; the project-path copy alone is not sufficient for the host-root location. If the publisher ID changes, update both repositories. The root `robots.txt` advertises a sitemap index covering the homepage and this project's sitemap. Do not buy a domain or hosting plan unless the owner separately requests it.

The site sends no analytics events. Add analytics only after deciding the product and updating the policy to match real behaviour. Never click your own ads, buy invalid traffic or promise guaranteed rankings. Search Console ownership and sitemap submission were completed separately; see dated status below.

## Content maintenance

Railway rules reviewed on 13 September 2026. Update the rule logic, guides and review dates when official rules change. Some older IRCTC pages still say 120 days; the code uses the newer Ministry 60-day announcement. Exceptions are explained; train schedules and live seats are not fetched.

- https://www.pib.gov.in/PressReleasePage.aspx?PRID=2065879
- https://contents.irctc.co.in/en/TatkalFaq.html
- https://www.pmf.irctc.co.in/cn/TermsAndConditions.html
- https://www.pib.gov.in/PressReleasePage.aspx?PRID=2135694

Edit copy in `scripts/content.py` and `scripts/build.py`; appearance in `src/style.css`; behaviour in `src/app.mjs`; calendar arithmetic in `src/dates.mjs`. Rebuild after every change. Tests cover date boundaries, leap years, day-2 boarding, opening instants and exported event formatting. `scripts/check.py` checks generated internal links, anchors, languages, labels, metadata and JSON-LD. Check the live deployment after changing the repository name, base path or metadata.


## Verified setup status — 22 September 2026

- Root homepage and calculator Auto ads deployments succeeded. The exact publisher script is present on the live homepage and English/Hindi calculator pages.
- Search Console URL-prefix property `https://yashwant-verma.github.io/` was verified using the HTML tag on the homepage. Keep that tag in place.
- Submitted `https://yashwant-verma.github.io/sitemap.xml`, covering the homepage and 16 calculator/content URLs. The report initially shows Couldn't fetch. Google live URL inspection successfully fetched the sitemap, with Crawl allowed: Yes and Page fetch: Successful; the sitemap was resubmitted once. Processing success is not yet confirmed.
- Google accepted a homepage indexing request into its priority crawl queue. Indexing and ranking are not guaranteed.
- AdSense still shows Getting ready (review pending) and ads.txt Not found, while the root ads.txt is publicly available with HTTP 200 and the correct publisher record. Do not delete and recreate the AdSense site merely to refresh this status.
- No paid domain, hosting plan, runner or API was purchased. No approval or earnings are claimed.
