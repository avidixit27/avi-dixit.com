interface SiteDetails {
  readonly email: string;
  readonly instagramUrl: string;
  readonly copyright: string;
}

export const SITE_DETAILS = Object.freeze({
  email: "avidixit27@gmail.com",
  instagramUrl: "https://www.instagram.com/_avid.photography_/",
  copyright: "Copyright @Avi Dixit 2026",
} as const satisfies SiteDetails);
