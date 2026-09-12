# UX Portfolio — Jae-ryeong Myllynen

A responsive portfolio site based on the **portfolio-blue** Figma design. Built with vanilla HTML, CSS, and JavaScript — ready to deploy on **GitHub Pages**.

## Preview locally

```bash
python3 -m http.server 8080
# or: npx serve .
```

Open [http://localhost:8080](http://localhost:8080).

## Structure

```
index.html              Home — hero, projects, quote, values, resume, contact
work/
  myhiab.html           MyHiab mobile app case study
  design-system.html    Design system mothership case study
  hiskill.html          HiSkill VR training case study
  physte.html           Physte mobile app case study
styles.css              Shared light theme (portfolio-blue) + transitions
script.js               Reveal animations, contact form (Formspree)
assets/
  images/               Profile, project thumbnails, case study images
  icons/                Value/principle icons
```

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set source to **Deploy from a branch**.
4. Choose your branch (e.g. `main`) and folder **`/ (root)`**.
5. Save — your site will be live at `https://<username>.github.io/<repo-name>/`.

## Contact form setup (Formspree)

The contact form hides your email address while still letting visitors reach you.

1. Create a free account at [formspree.io](https://formspree.io).
2. Create a new form and confirm your email address.
3. Copy your form ID (the part after `/f/` in the form URL).
4. In `index.html`, replace `YOUR_FORM_ID` in the form action:

```html
<form action="https://formspree.io/f/abcxyz123" ...>
```

Messages will arrive in your inbox without exposing your email on the site.

## Customization

- **Copy & content**: Edit text directly in the HTML files.
- **Colors & typography**: Adjust CSS variables at the top of `styles.css` (`--color-bg`, `--color-accent`, etc.).
- **Images**: Project thumbnails live in `assets/images/` — update `src` paths in `index.html` and `work/*.html` as needed.
