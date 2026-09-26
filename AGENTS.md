<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Univero's prototype uses client-side local storage for profile, shortlist, comparison, and application statuses because the supplied hackathon brief explicitly requests frontend-only interactions.
- University catalog and transparent weighted scoring live in a shared client-safe module so every results, detail, and comparison view uses identical demo data.
- The uploaded Univero logo is served via its CDN asset pointer while the favicon is a locally derived raster; this retains the supplied brand and keeps the repository lightweight.
