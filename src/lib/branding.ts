export const SANCRISTOBAL_CENTER = "IES San Cristóbal de los Ángeles";

export const SANCRISTOBAL_BRANDING = {
  slug: "sancristobal",
  center: SANCRISTOBAL_CENTER,
  name: SANCRISTOBAL_CENTER,
  logoSrc: "/sancristobal-logo.svg",
} as const;

export type BrandingConfig = {
  name: string;
  logoSrc: string;
};
