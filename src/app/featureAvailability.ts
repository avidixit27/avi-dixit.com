export interface FeatureAvailability {
  readonly shop: boolean;
  readonly contact: boolean;
}

export const RELEASED_FEATURES: FeatureAvailability = Object.freeze({
  shop: false,
  contact: true,
});

export function resolveFeatureAvailability(
  released: FeatureAvailability,
  enableAllFeatures = false,
): FeatureAvailability {
  return Object.freeze({
    shop: enableAllFeatures || released.shop,
    contact: enableAllFeatures || released.contact,
  });
}

export const FEATURE_AVAILABILITY = resolveFeatureAvailability(
  RELEASED_FEATURES,
  import.meta.env.ALL_FEATURES_DEVELOPMENT === true,
);
