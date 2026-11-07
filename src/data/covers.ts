import baksoImage from '../../assets/images/bakso.jpg';
import gadoGadoImage from '../../assets/images/gado-gado.jpg';
import nasiGorengImage from '../../assets/images/nasi-goreng.jpg';
import rendangImage from '../../assets/images/rendang.jpg';
import sateImage from '../../assets/images/sate.jpg';
import sotoImage from '../../assets/images/soto.jpg';
import type { RecipeCategory } from '../types/recipe';

/**
 * Foto bawaan yang boleh dipakai sebagai sampul resep buatan pengguna.
 * Semua aset sudah ikut bundle sehingga fitur tetap berjalan tanpa internet.
 */
export const recipeCovers = [
  {
    id: 'rendang',
    label: 'Rendang',
    image: rendangImage,
    accent: ['#7C1118', '#B4232A'],
  },
  {
    id: 'sate',
    label: 'Sate',
    image: sateImage,
    accent: ['#7A3515', '#B5652F'],
  },
  {
    id: 'soto',
    label: 'Soto',
    image: sotoImage,
    accent: ['#78502E', '#B07C4A'],
  },
  {
    id: 'nasi-goreng',
    label: 'Nasi goreng',
    image: nasiGorengImage,
    accent: ['#70351A', '#A8582E'],
  },
  {
    id: 'gado-gado',
    label: 'Gado-gado',
    image: gadoGadoImage,
    accent: ['#4E6246', '#7D9470'],
  },
  {
    id: 'bakso',
    label: 'Bakso',
    image: baksoImage,
    accent: ['#6E2B24', '#A34B3E'],
  },
] as const;

export type RecipeCover = (typeof recipeCovers)[number];
export type RecipeCoverId = RecipeCover['id'];

export const categoryAccents: Record<
  RecipeCategory,
  readonly [string, string]
> = {
  Sapi: ['#7C1118', '#B4232A'],
  Ayam: ['#7A3515', '#B5652F'],
  Berkuah: ['#78502E', '#B07C4A'],
  Cepat: ['#70351A', '#A8582E'],
  Sayur: ['#4E6246', '#7D9470'],
};

export function isRecipeCoverId(value: unknown): value is RecipeCoverId {
  return recipeCovers.some((cover) => cover.id === value);
}

export function getRecipeCover(id: unknown): RecipeCover {
  if (isRecipeCoverId(id)) {
    return recipeCovers.find((cover) => cover.id === id) ?? recipeCovers[0];
  }
  return recipeCovers[0];
}
