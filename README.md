# Dapur Nusa

Buku resep masakan rumah Indonesia untuk dipakai sambil memasak: jelajahi resep,
centang bahan dan alat, lalu ikuti panduan langkah demi langkah dengan timer
pintar. Kamu juga bisa menulis resep sendiri lengkap dengan foto sampul,
bahan, alat, langkah, timer, dan tips. Semua data tersimpan lokal di perangkat,
tanpa akun dan tanpa jaringan.

## Stack

| Kebutuhan | Teknologi |
| --- | --- |
| Framework | Expo SDK 58 · React Native 0.88 · React 19.3 |
| Bahasa | TypeScript (strict) |
| Navigasi | React Navigation 7 — native stack + bottom tabs |
| Animasi | React Native Reanimated 4 + Moti |
| Glassmorphism | `expo-blur` + lapisan tint/border |
| Gambar | `expo-image` (cache memory-disk) |
| Ikon | `@expo/vector-icons` (Ionicons) |
| Persistensi | `@react-native-async-storage/async-storage` |
| Resep pengguna | Form lokal + sampul dari koleksi bawaan |
| Haptics | `expo-haptics` |
| Timer / layar | `useFrameCallback` Reanimated + `expo-keep-awake` |
| Tipografi | Playfair Display + Plus Jakarta Sans |

> Catatan: proyek ini memakai Reanimated 4 (bukan v3), sesuai versi yang
> kompatibel dengan Expo SDK 58 / React Native 0.88.

## Struktur folder

```text
dapur-nusa/
├── App.tsx                        # font, splash, provider, root navigator
├── index.ts                       # registerRootComponent
├── app.json                       # konfigurasi Expo (icon, splash, scheme)
├── assets/
│   └── images/                    # 6 foto masakan (di-bundle lokal)
├── screenshots/                   # bukti visual tiap layar
└── src/
    ├── components/
    │   ├── ui/
    │   │   ├── GlassSurface.tsx   # inti efek liquid glass
    │   │   ├── PressableScale.tsx # micro-interaction skala
    │   │   ├── IconButton.tsx
    │   │   ├── Chip.tsx
    │   │   ├── SectionHeader.tsx
    │   │   └── Divider.tsx
    │   ├── RecipeCard.tsx         # kartu grid, baris, featured
    │   ├── RecipeHero.tsx         # header parallax + target shared element
    │   ├── RecipeComposerBanner.tsx # ajakan menulis resep di beranda
    │   ├── ChecklistCard.tsx      # checklist bahan/alat + animasi coret
    │   ├── TimerRing.tsx          # progress bar melingkar (SVG)
    │   ├── SmartTimerSheet.tsx    # panel timer (mulai/jeda/+1 menit/preset)
    │   ├── SharedImageOverlay.tsx # lapisan transisi shared element
    │   ├── SearchBar.tsx
    │   └── LiquidTabBar.tsx       # tab bar kaca mengambang
    ├── data/
    │   ├── recipes.ts             # 6 resep lengkap (bahan, alat, langkah, tips)
    │   └── covers.ts              # 6 foto sampul untuk resep pengguna
    ├── hooks/
    │   ├── useSmartTimer.ts       # timer berbasis jam dinding
    │   ├── useRecipeChecklist.ts  # selector checklist per resep
    │   ├── useOpenRecipe.ts       # buka detail + siapkan transisi
    │   └── useHaptics.ts          # haptics yang bisa dimatikan
    ├── navigation/
    │   ├── RootNavigator.tsx
    │   └── types.ts               # typed navigation
    ├── providers/
    │   ├── DapurProvider.tsx      # favorit, checklist, riwayat, resep pengguna
    │   └── SharedImageProvider.tsx# state transisi shared element
    ├── screens/
    │   ├── HomeScreen.tsx
    │   ├── SearchScreen.tsx
    │   ├── RecipeDetailScreen.tsx
    │   ├── CookingModeScreen.tsx
    │   ├── FavoritesScreen.tsx
    │   ├── ProfileScreen.tsx
    │   └── AddRecipeScreen.tsx    # form resep buatan sendiri
    ├── theme/
    │   ├── index.ts               # warna, font, spacing, shadow, tipografi
    │   └── motion.ts              # preset timing/spring untuk Moti
    ├── types/
    │   ├── recipe.ts              # model data resep
    │   └── env.d.ts               # deklarasi import gambar
    └── utils/
        ├── recipes.ts
        ├── customRecipe.ts        # validasi, create, sanitasi resep pengguna
        ├── confirm.ts             # konfirmasi Alert native + fallback web
        └── time.ts                # format jam, durasi, tanggal Indonesia
```

## Menjalankan

```bash
npm install
npx expo start          # Expo Go / development build
npm run typecheck       # tsc --noEmit
npm run lint            # expo lint
npm run doctor          # npx expo-doctor
```

Build web untuk verifikasi bundling:

```bash
npx expo export --platform web
```

Folder `android/` sudah pernah dihasilkan di mesin pengembangan ini; `ios/`
belum ada. Keduanya mengikuti Continuous Native Generation. Jangan mengedit
file native secara manual — ubah `app.json` atau config plugin, lalu jalankan
`npx expo prebuild` (atau `npx expo run:android` / `run:ios`) agar folder native
disinkronkan kembali. Tanpa prebuild, perubahan seperti ikon, splash,
orientation, scheme, dan plugins tidak otomatis masuk ke folder native.

## Alur aplikasi

```text
Tabs (Home · Favorites · Profile)
  ├─ Search
  ├─ AddRecipe (full screen modal)
  └─ RecipeDetail
       └─ CookingMode (full screen modal)
```

1. **Home** menampilkan sapaan, pencarian, filter kategori, banner untuk menulis
   resep, resep pilihan editor, resep cepat, dan grid resep.
2. **Search** memfilter berdasarkan judul, daerah, tag, deskripsi, dan bahan.
   Pencarian multi-kata bersifat AND (`"santan pedas"` harus cocok keduanya),
   dan resep buatan pengguna ikut dicari.
3. **RecipeDetail** menampilkan hero parallax, meta resep, checklist bahan dan
   alat, langkah-langkah, tips, serta tombol masuk mode masak. Resep buatan
   pengguna mendapat badge “Resep saya” dan tombol hapus.
4. **CookingMode** menampilkan satu langkah per halaman dengan teks besar,
   progress, tombol timer per langkah, dan panel timer pintar.
5. **Favorites** menampilkan resep yang disimpan; bisa masuk mode kelola untuk
   menghapus. Resep buatan pengguna juga bisa disimpan ke sini.
6. **Profile** menampilkan statistik memasak, riwayat terakhir, koleksi resep
   buatan sendiri, pengaturan haptics, dan reset data.
7. **AddRecipe** adalah form bertahap untuk membuat resep: pilih foto sampul,
   isi identitas dan cerita, atur kategori/kesulitan/durasi/porsi/tag, lalu
   tambahkan bahan, alat, langkah (dengan timer opsional), dan tips.

## Logika penting

### 1. Liquid glass

`GlassSurface` adalah satu-satunya komponen yang tahu cara membuat permukaan
kaca. Ia menerima `tone` (`light`, `strong`, `dark`, `red`), `radius`, dan
`intensity`. Implementasinya berlapis:

1. `BlurView` native (iOS) memblur konten di belakangnya.
2. Lapisan `tint` semi-transparan memberi warna hangat agar tidak terasa
   seperti blur iOS yang dingin.
3. Border putih tipis (`StyleSheet.hairlineWidth * 1.6`) memberi kesan tepi
   kaca.
4. `overflow: 'hidden'` + `borderRadius` menjaga semua lapisan tetap terpotong
   rapi.

Di Android, blur native sengaja tidak diaktifkan; komponen memakai tint yang
lebih pekat (fallback) karena `BlurView` di Android membutuhkan `BlurTargetView`
dan dapat menurunkan performa pada perangkat lama. Semua layar memakai
komponen yang sama, jadi perubahan gaya kaca cukup dilakukan di satu tempat.

### 2. Shared element transition

Transisi tidak memakai library tambahan. Alurnya:

1. `RecipeCard` menyimpan `ref` pada bingkai gambar dan memanggil
   `measureInWindow` saat kartu ditekan.
2. `useOpenRecipe` mengirim `MeasuredRect` ke `SharedImageProvider`
   (`beginTransition`) sebelum `navigation.navigate`.
3. `RecipeHero` di layar detail mengukur posisi akhirnya dan memanggil
   `setDestination`.
4. `SharedImageOverlay` — berada di atas seluruh navigator — menginterpolasi
   `left/top/width/height/borderRadius` dari kotak asal ke kotak tujuan.
5. Saat pengguna menekan kembali, `closeTransition` menjalankan animasi balik,
   baru setelah itu `navigation.goBack()` dipanggil.

Karena semua geometri dianimasikan dengan Reanimated di UI thread, transisi
tetap halus walaupun layar detail sedang mount dan memuat gambar.

### 3. Checklist yang persisten dan tetap 60fps

- `DapurProvider` menyimpan `checklists: Record<recipeId, Record<itemId, true>>`.
  Hanya item yang dicentang yang disimpan, sehingga payload AsyncStorage kecil.
- Setiap `ChecklistRow` memiliki `useSharedValue` sendiri. Saat `checked`
  berubah, satu `withTiming` (260 ms) menggerakkan:
  - warna lingkaran (`interpolateColor`),
  - skala centang,
  - garis coret (`scaleX` + `transformOrigin: 'left center'`),
  - opacity label.
- Animasi berjalan di UI thread; React hanya mengubah satu item di state.
  Baris lain tidak perlu menghitung ulang animasi.
- `useRecipeChecklist` adalah selector tipis: menghitung jumlah bahan/alat yang
  dicentang dan menyediakan `toggleItem`, `resetIngredients`, `resetEquipment`.
- Data dihidrasi sekali saat aplikasi dibuka; splash ditahan sampai
  `isReady === true`, jadi tidak ada kedipan checklist kosong.

### 4. Timer pintar tanpa re-render per frame

`useSmartTimer` memisahkan dua jenis state:

| State | Media | Frekuensi |
| --- | --- | --- |
| `remainingMs`, `durationMs`, `endAtMs` | Reanimated shared value | tiap frame |
| `remainingSeconds`, `isRunning`, `isFinished` | React state | hanya saat detik berubah |

Cara kerjanya:

1. Saat mulai, `endAtMs = Date.now() + remainingMs`. Ini jam dinding, bukan
   akumulasi frame, sehingga timer tidak melambat saat frame drop.
2. `useFrameCallback` aktif hanya ketika timer berjalan. Setiap frame ia
   menghitung `endAtMs - Date.now()`, menulis ke `remainingMs`, dan memanggil
   `runOnJS(setRemainingSeconds)` hanya jika angka detik berubah.
3. `TimerRing` memakai `useAnimatedProps` untuk mengubah `strokeDashoffset`
   lingkaran SVG langsung di UI thread.
4. `pause` menghitung sisa waktu secara eksak dari jam dinding, sehingga
   melanjutkan timer tidak menambah waktu tersembunyi.
5. `addMinute` menambah durasi dan sisa waktu; jika timer sedang berjalan,
   `endAtMs` digeser agar penambahan langsung terasa.
6. `restartWith` mengatur ulang shared value lalu langsung memulai; karena
   shared value diperbarui sinkron, `start()` membaca durasi baru tanpa
   menunggu render React.
7. `expo-keep-awake` menjaga layar tetap menyala selama mode masak.
8. Timer bersifat global per Cooking Mode, tetapi `timerStepIndex` menyimpan
   langkah asal timer. Pengingat, tombol ulangi, dan label panel tetap menunjuk
   langkah yang benar walaupun pengguna sudah pindah langkah.
9. Memulai timer baru atau memilih preset menargetkan langkah yang sedang
   dibuka; melanjutkan timer yang dijeda tetap memakai langkah asalnya.

### 5. Parallax dan micro-interactions

- `RecipeHero` menerima `scrollY` shared value dari `Animated.ScrollView`.
  `useAnimatedStyle` menginterpolasi `scale` (pull-down) dan `translateY`
  (scroll-up) dengan `Extrapolation.CLAMP`.
- `PressableScale` mengganti `Animated.Value` lama dengan shared value +
  `withSpring`, jadi feedback tekan tidak memicu render React.
- `RecipeCard`, `RecipeRow`, dan `FeaturedRecipeCard` memakai `MotiView`
  dengan stagger delay kecil agar daftar terasa hidup saat pertama dibuka.
- Animasi baru tersebar di seluruh alur: chip kategori, banner resep, hasil
  pencarian, toolbar favorit, section profil, meta/checklist/langkah/tips di
  detail, progress mode masak, dan seluruh form `AddRecipeScreen`.

> **Reduced motion.** Reanimated membaca preferensi sistem
> `prefers-reduced-motion`. Jika pengguna mengaktifkannya di OS atau browser,
> Reanimated menampilkan peringatan di mode development dan menonaktifkan
> sebagian animasi secara default. Ini perilaku aksesibilitas yang benar, bukan
> error aplikasi; peringatan tersebut tidak muncul di build production.

### 6. Resep buatan pengguna

Resep sendiri tidak memakai backend: semuanya hidup di perangkat yang sama
dengan data favorit dan checklist.

1. `AddRecipeScreen` menyusun `CustomRecipeDraft`, lalu
   `validateCustomRecipeDraft` memeriksa field wajib, jumlah bahan/langkah,
   batas durasi, dan porsi. Pesan error pertama menggulir layar ke bagian yang
   bermasalah.
2. `createCustomRecipe` mengubah draft menjadi `Recipe` lengkap dengan ID
   berawalan `custom-`, ID unik untuk setiap bahan/alat/langkah, serta
   `isCustom: true` dan `createdAt`.
3. Foto sampul disimpan sebagai `coverId`, bukan nilai `require()` hasil bundle.
   Saat hidrasi, `getRecipeCover` memetakan kembali `coverId` ke aset lokal.
   Ini membuat data tetap valid setelah bundle di-build ulang dan tetap aman
   dipakai lintas platform.
4. `DapurProvider` menyimpan `customRecipes` di AsyncStorage dan menyusun
   `allRecipes = [...customRecipes, ...recipes]`. Beranda, pencarian, favorit,
   profil, detail, dan mode masak membaca daftar yang sama, sehingga resep baru
   langsung muncul tanpa restart.
5. Saat hidrasi, `sanitizeCustomRecipe` membersihkan data yang rusak atau
   berasal dari versi lama. Resep yang tidak lolos validasi dilewati, bukan
   membuat seluruh state gagal dimuat.
6. Menghapus resep custom juga membersihkan favorit, checklist, riwayat masak,
   dan mengurangi `cookCount` sesuai jumlah riwayat resep tersebut. Konfirmasi
   memakai `confirmAction` agar bekerja di native maupun web.

### 7. Aksesibilitas di web

React Native Web 0.21 tidak lagi memetakan `accessibilityState` ke atribut
ARIA. Karena itu status interaktif ditulis eksplisit di samping prop native:

- checklist memakai `aria-checked`,
- chip filter memakai `aria-pressed`,
- item tab bar memakai `aria-selected`.

`Alert.alert` juga no-op di react-native-web. Semua konfirmasi destruktif
(keluar Cooking Mode, reset data Profil) memakai `confirmAction` dari
`src/utils/confirm.ts`: `window.confirm` di web, `Alert.alert` di iOS/Android.

### 8. Navigasi dan state

- `DapurProvider` adalah satu-satunya sumber kebenaran untuk favorit,
  checklist, riwayat masak, dan preferensi haptics.
- `useRecipeChecklist` dan `useHaptics` membaca konteks tersebut; komponen
  presentasional tetap bebas dari logika penyimpanan.
- Root stack memakai `presentation: 'fullScreenModal'` untuk Cooking Mode agar
  fokus memasak tidak terganggu tab bar.
- Tab bar kustom (`LiquidTabBar`) mengambang di atas konten dengan safe-area
  inset; setiap item menganimasikan pill merah saat aktif.

## Verifikasi

```bash
npm run typecheck   # lolos
npm run lint        # lolos
npm run doctor      # 18/20
npx expo export --platform web     # bundling sukses
npx expo export --platform android # bundling sukses
```

`expo-doctor` melaporkan dua temuan:

1. `.expo/` dilaporkan belum di-ignore. Ini false positive karena proyek bukan
   repository Git, sehingga `expo-doctor` tidak bisa memeriksa `.gitignore`;
   file itu sendiri sudah memuat `.expo/` untuk saat repo diinisialisasi.
2. Konfigurasi `app.json` belum tersinkron dengan folder `android/`. Jalankan
   `npx expo prebuild` (atau `npx expo run:android`) setelah mengubah konfigurasi
   native seperti ikon, splash, scheme, atau plugins.

Uji UI web interaktif (Playwright) tidak dijalankan di lingkungan ini karena
tidak tersedia browser otomatis. Verifikasi yang dilakukan: typecheck, lint,
pemeriksaan statis alur resep pengguna, serta export web dan Android. Proyek ini
bukan git repository, jadi perubahan tidak di-commit.

Screenshot hasil aplikasi ada di folder [`screenshots/`](./screenshots).
