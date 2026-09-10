import signatureLogo from "../assets/icons/avi-signature-logo.svg";
import { SITE_DETAILS } from "../resources/site";

export default function Footer() {
  return (
    <footer
      aria-label="Site footer"
      className="z-0 min-h-52 overflow-hidden border-t border-border bg-panel text-sm text-text-muted lg:fixed lg:inset-x-0 lg:bottom-0 lg:h-52"
    >
      <img
        src={signatureLogo}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-8 -left-12 h-60 w-auto select-none opacity-95 sm:-left-8 lg:-bottom-10 lg:-left-16 lg:h-72"
      />
      <div className="page-container relative z-10 flex min-h-52 flex-col justify-end gap-5 py-7 pl-32 sm:pl-40 lg:min-h-full lg:flex-row lg:items-end lg:justify-between lg:pb-9 lg:pl-64">
        <p className="max-w-48 leading-6">{SITE_DETAILS.copyright}</p>
        <div className="flex flex-col gap-3 lg:items-end">
          <a
            href={`mailto:${SITE_DETAILS.email}`}
            className="w-fit rounded-sm transition-colors hover:text-focus"
          >
            {SITE_DETAILS.email}
          </a>
          <a
            href={SITE_DETAILS.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit rounded-sm transition-colors hover:text-focus"
          >
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
