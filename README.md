# Micro.Cam

A fast, searchable link hub and bedside score calculators, built with Jekyll.

## Editing

| To change… | Edit |
|---|---|
| Links and categories | `_data/links.yml` |
| Scoring calculators | `assets/js/scores.js` (the `SCORES` list at the top) |
| Site title | `_config.yml` |
| Colours / layout | `assets/css/style.css` |

Start by replacing the three `example.org/replace-me` links in the **Local & on-call** section with your trust's links.

**Keyboard:** press `/` to jump to the filter box, type, then `Enter` opens the top match. `Esc` clears.

## Publish on GitHub Pages (free)

1. Create a new GitHub repository and upload all these files (including the hidden `.github` folder).
2. In the repo go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` (or re-run the workflow). The site appears at `https://<username>.github.io/<repo>/` within a minute or two.

The workflow sets the base URL automatically, so the repo can have any name.

> The site has `noindex` set so search engines skip it. If you put trust-internal links in, consider making the repository private (GitHub Pages from private repos needs a paid plan) or keeping those links out.

## Preview locally (optional)

Needs Ruby 3.x.

```sh
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000.

## Other hosts

Netlify / Cloudflare Pages: connect the repo, build command `jekyll build`, publish directory `_site`.
