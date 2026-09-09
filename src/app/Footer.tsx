import { SITE_DETAILS } from "../resources/site";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface text-sm text-text-muted">
      <div className="page-container flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p>{SITE_DETAILS.copyright}</p>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <a
            href={`mailto:${SITE_DETAILS.email}`}
            className="rounded-sm transition-colors hover:text-brand-warm"
          >
            {SITE_DETAILS.email}
          </a>
          <a
            href={SITE_DETAILS.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm transition-colors hover:text-brand-vivid"
          >
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
