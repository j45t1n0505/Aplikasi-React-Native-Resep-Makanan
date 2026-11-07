/// <reference types="expo/types" />

/**
 * Deklarasi statis untuk aset gambar yang di-resolve Metro.
 *
 * Saat aplikasi di-bundle, `import foto from './foto.jpg'` menghasilkan
 * sebuah asset ID (number) yang bisa langsung dipakai oleh `expo-image`
 * maupun komponen `Image` bawaan React Native. Tanpa deklarasi ini,
 * TypeScript menganggap setiap import `.jpg`/`.png` sebagai module yang
 * tidak ditemukan, meskipun Metro tetap bisa mem-bundle-nya.
 */

declare module '*.png' {
  const asset: number;
  export default asset;
}

declare module '*.jpg' {
  const asset: number;
  export default asset;
}

declare module '*.jpeg' {
  const asset: number;
  export default asset;
}

declare module '*.gif' {
  const asset: number;
  export default asset;
}

declare module '*.webp' {
  const asset: number;
  export default asset;
}
