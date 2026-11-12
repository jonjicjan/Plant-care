const BASE = 'https://media.base44.com/images/public/6ae6528026f350ab832f641a';

export const HERO_IMAGE = `${BASE}/e8b44ff3e_generated_image.png`;
export const HERO_IMAGE_SECONDARY = `${BASE}/40797e88d_generated_image.png`;

export const GALLERY = {
  foliage: `${BASE}/06baebf65_generated_image.png`,
  tropical: `${BASE}/6e24e307d_generated_image.png`,
  succulent: `${BASE}/c7c61d5df_generated_image.png`,
  fern: `${BASE}/0aefa9160_generated_image.png`,
  flowering: `${BASE}/10221f702_generated_image.png`,
  herb: `${BASE}/b0e5f7d6c_generated_image.png`,
  trailing: `${BASE}/40797e88d_generated_image.png`,
};

const TYPE_IMAGES = {
  'Indoor foliage': GALLERY.foliage,
  Tropical: GALLERY.tropical,
  Succulent: GALLERY.succulent,
  Cactus: GALLERY.succulent,
  Fern: GALLERY.fern,
  Flowering: GALLERY.flowering,
  Herb: GALLERY.herb,
  Trailing: GALLERY.trailing,
  Other: GALLERY.foliage,
};

export function plantImageFor(plantType) {
  return TYPE_IMAGES[plantType] || GALLERY.tropical;
}