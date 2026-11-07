import baksoImage from '../../assets/images/bakso.jpg';
import gadoGadoImage from '../../assets/images/gado-gado.jpg';
import nasiGorengImage from '../../assets/images/nasi-goreng.jpg';
import rendangImage from '../../assets/images/rendang.jpg';
import sateImage from '../../assets/images/sate.jpg';
import sotoImage from '../../assets/images/soto.jpg';
import type { Recipe } from '../types/recipe';

/**
 * Semua konten resep ditulis lokal supaya aplikasi tetap berfungsi penuh
 * tanpa koneksi internet. Foto-foto berasal dari Pexels (lisensi bebas pakai)
 * dan disimpan di dalam bundle aplikasi.
 */
export const recipes: Recipe[] = [
  {
    id: 'rendang',
    title: 'Rendang Daging Sapi',
    origin: 'Padang, Sumatera Barat',
    tagline: 'Perlahan, hingga kuahnya menjadi hitam berkilau.',
    description:
      'Rendang adalah pelajaran tentang kesabaran: daging sapi dimasak perlahan bersama santan dan rempah sampai kuah menyusut, minyak keluar, dan bumbunya menempel di setiap serat daging. Di rumah, rendang paling nikmat dibuat sehari sebelum disajikan.',
    image: rendangImage,
    durationMinutes: 210,
    prepMinutes: 25,
    difficulty: 'Menantang',
    servings: 6,
    category: 'Sapi',
    tags: ['Padang', 'Santan', 'Akhir pekan', 'Pedas'],
    accent: ['#7C1118', '#B4232A'],
    ingredientGroups: [
      {
        id: 'utama',
        title: 'Bahan utama',
        items: [
          {
            id: 'daging',
            label: '1 kg daging sapi sengkel',
            note: 'potong 4 cm, suhu ruang',
          },
          {
            id: 'santan-kental',
            label: '1 liter santan kelapa kental',
            note: 'dari 1 butir kelapa tua',
          },
          {
            id: 'santan-encer',
            label: '400 ml santan encer',
          },
          {
            id: 'kerisik',
            label: '150 g kelapa parut sangrai',
            note: 'haluskan menjadi kerisik',
          },
        ],
      },
      {
        id: 'bumbu',
        title: 'Bumbu halus',
        items: [
          { id: 'cabai', label: '10 buah cabai merah keriting' },
          { id: 'bawang-merah', label: '10 butir bawang merah' },
          { id: 'bawang-putih', label: '6 siung bawang putih' },
          { id: 'lengkuas', label: '4 cm lengkuas, muda' },
          { id: 'jahe', label: '3 cm jahe' },
          { id: 'kunyit', label: '2 cm kunyit' },
          { id: 'ketumbar', label: '1 sdt ketumbar sangrai' },
          { id: 'merica', label: '½ sdt merica butiran' },
          { id: 'garam', label: '1½ sdt garam' },
        ],
      },
      {
        id: 'aromatik',
        title: 'Rempah aromatik',
        items: [
          { id: 'serai', label: '2 batang serai, memarkan' },
          { id: 'daun-jeruk', label: '6 lembar daun jeruk' },
          { id: 'daun-salam', label: '4 lembar daun salam' },
          {
            id: 'daun-kunyit',
            label: '2 lembar daun kunyit',
            note: 'bila tidak ada, lewati saja',
          },
          { id: 'asam-kandis', label: '4 butir asam kandis' },
          { id: 'gula-merah', label: '1 sdt gula merah sisir' },
        ],
      },
    ],
    equipment: [
      { id: 'wajan', label: 'Wajan tebal 28 cm', note: 'dasar lebar' },
      { id: 'blender', label: 'Blender atau cobek batu' },
      { id: 'spatula', label: 'Spatula kayu' },
      { id: 'mangkuk', label: 'Mangkuk untuk kerisik' },
      { id: 'timbangan', label: 'Timbangan dapur' },
    ],
    steps: [
      {
        id: 'langkah-1',
        title: 'Siapkan daging',
        description:
          'Keluarkan daging dari kulkas 30 menit sebelum memasak. Potong melawan serat sekitar 4 cm, buang lemak berlebih yang bisa membuat kuah terlalu berminyak. Tepuk permukaannya hingga kering.',
        tip: 'Daging bersuhu ruang lebih cepat menyerap bumbu dan menghasilkan tekstur yang lembut.',
        timerSeconds: 600,
        imagePosition: 'center',
      },
      {
        id: 'langkah-2',
        title: 'Haluskan bumbu',
        description:
          'Blender cabai, bawang merah, bawang putih, lengkuas, jahe, kunyit, ketumbar, merica, dan garam. Tambahkan sedikit minyak bila blender tersendat. Hasilnya harus benar-benar halus agar kuah tidak terasa kasar.',
        tip: 'Boleh gunakan cobek untuk tekstur bumbu yang lebih tradisional; tumbuk bertahap.',
        timerSeconds: 900,
        imagePosition: 'top',
      },
      {
        id: 'langkah-3',
        title: 'Tumis hingga harum',
        description:
          'Panaskan wajan dengan 3 sdm minyak. Tumis bumbu halus bersama serai, daun jeruk, daun salam, dan daun kunyit. Aduk terus dengan api sedang sampai minyak terpisah dan warna bumbu mulai gelap.',
        tip: 'Jangan tergesa-gesa. Tahap ini membangun rasa rendang yang dalam.',
        timerSeconds: 480,
        imagePosition: 'bottom',
      },
      {
        id: 'langkah-4',
        title: 'Masukkan daging',
        description:
          'Masukkan potongan daging ke dalam tumisan bumbu. Aduk hingga seluruh permukaan daging berubah warna dan terbalut bumbu, sekitar 5 menit. Masukkan juga asam kandis dan gula merah.',
        timerSeconds: 300,
        imagePosition: 'center',
      },
      {
        id: 'langkah-5',
        title: 'Tuang santan encer',
        description:
          'Tuang santan encer sedikit demi sedikit sambil diaduk agar bumbu larut. Masak tanpa tutup sampai mendidih, lalu kecilkan api. Kotoran yang naik ke permukaan bisa dibuang dengan sendok.',
        timerSeconds: 900,
        imagePosition: 'top',
      },
      {
        id: 'langkah-6',
        title: 'Masak bersama santan kental',
        description:
          'Tuang santan kental dan masukkan kerisik. Masak dengan api kecil, aduk bagian dasar wajan setiap 10 menit. Kuah akan berubah dari putih menjadi cokelat muda dan mulai mengeluarkan minyak.',
        tip: 'Aduk, jangan tinggalkan wajan. Santan yang dibiarkan bisa pecah dan bumbu mudah hangus.',
        timerSeconds: 2700,
        imagePosition: 'bottom',
      },
      {
        id: 'langkah-7',
        title: 'Keringkan rendang',
        description:
          'Lanjutkan memasak hingga kuah hampir habis dan minyak keluar. Warna rendang akan menjadi cokelat kehitaman. Cicipi; tambahkan garam sedikit bila perlu. Aduk lebih sering menjelang akhir.',
        tip: 'Untuk rendang kering, masak sampai minyak bening terlihat di pinggir wajan.',
        timerSeconds: 3600,
        imagePosition: 'center',
      },
      {
        id: 'langkah-8',
        title: 'Diamkan, lalu sajikan',
        description:
          'Matikan api dan diamkan rendang 15 menit sebelum dipindahkan ke wadah. Sajikan hangat dengan nasi putih, daun singkong rebus, dan kerupuk. Rendang juga enak disantap keesokan hari.',
        timerSeconds: 900,
        imagePosition: 'top',
      },
    ],
    tips: [
      'Sengkel atau paha atas memberi rendang tekstur serat yang paling baik.',
      'Simpan rendang di wadah tertutup di kulkas hingga 5 hari; panaskan dengan api kecil.',
      'Jika ingin kuah lebih basah, angkat rendang 20 menit lebih awal dari tahap pengeringan.',
      'Kerisik adalah kunci rasa gurih; jangan diganti dengan kelapa parut mentah.',
    ],
  },
  {
    id: 'sate-ayam',
    title: 'Sate Ayam Madura',
    origin: 'Madura, Jawa Timur',
    tagline: 'Manis, smoky, dan bumbu kacang yang pekat.',
    description:
      'Sate Madura yang otentik punya dua lapis rasa: marinasi kecap yang meresap, lalu bumbu kacang yang dioleskan saat memanggang. Bakar di atas arang atau grill pan tebal, dan jangan takut memberi warna cokelat tua di ujung tusuk.',
    image: sateImage,
    durationMinutes: 75,
    prepMinutes: 25,
    difficulty: 'Sedang',
    servings: 4,
    category: 'Ayam',
    tags: ['Madura', 'Bakar', 'Bumbu kacang', 'Favorit'],
    accent: ['#8F4A17', '#C97732'],
    ingredientGroups: [
      {
        id: 'utama',
        title: 'Ayam & marinasi',
        items: [
          { id: 'ayam', label: '600 g fillet paha ayam' },
          { id: 'jeruk-nipis', label: '2 buah jeruk nipis' },
          { id: 'kecap-marinasi', label: '4 sdm kecap manis' },
          { id: 'minyak', label: '2 sdm minyak goreng' },
          { id: 'garam-ayam', label: '½ sdt garam' },
          { id: 'tusuk', label: '20 batang tusuk sate' },
        ],
      },
      {
        id: 'kacang',
        title: 'Bumbu kacang',
        items: [
          { id: 'kacang', label: '200 g kacang tanah', note: 'goreng atau sangrai' },
          { id: 'bawang-putih-sate', label: '4 siung bawang putih' },
          { id: 'bawang-merah-sate', label: '5 butir bawang merah' },
          { id: 'cabai-sate', label: '4 buah cabai merah keriting' },
          { id: 'gula-merah-sate', label: '50 g gula merah' },
          { id: 'kecap-bumbu', label: '5 sdm kecap manis' },
          { id: 'air-bumbu', label: '200 ml air hangat' },
          { id: 'garam-bumbu', label: '1 sdt garam' },
          { id: 'limau', label: '2 buah jeruk limau' },
        ],
      },
      {
        id: 'pelengkap',
        title: 'Pelengkap',
        items: [
          { id: 'bawang-pelengkap', label: '4 butir bawang merah mentah' },
          { id: 'lontong', label: '4 potong lontong' },
          { id: 'acar', label: 'Acar timun & wortel' },
          { id: 'bawang-goreng-sate', label: 'Bawang goreng secukupnya' },
        ],
      },
    ],
    equipment: [
      { id: 'grill', label: 'Grill pan atau pembakar arang' },
      { id: 'food-processor', label: 'Food processor / blender kering' },
      { id: 'sikat', label: 'Sikat oles atau kuas silikon' },
      { id: 'mangkuk-sate', label: 'Mangkuk untuk bumbu oles' },
      { id: 'tusuk-alat', label: 'Penjepit sate' },
    ],
    steps: [
      {
        id: 'langkah-1',
        title: 'Marinasi ayam',
        description:
          'Potong ayam menjadi kubus 2 cm. Lumuri dengan perasan jeruk nipis dan garam, diamkan 10 menit, lalu tambahkan kecap manis dan minyak. Aduk rata dan simpan di kulkas selama 20 menit.',
        tip: 'Jangan marinasi terlalu lama; kecap bisa membuat daging cepat gosong saat dipanggang.',
        timerSeconds: 1200,
        imagePosition: 'center',
      },
      {
        id: 'langkah-2',
        title: 'Buat bumbu kacang',
        description:
          'Goreng kacang tanah hingga matang, tiriskan. Haluskan bersama bawang, cabai, dan gula merah. Masak bumbu kacang dengan air, kecap, dan garam sambil diaduk sampai mengeluarkan minyak dan mengental.',
        tip: 'Bumbu kacang yang terlalu kental bisa diencerkan dengan air hangat sebelum disajikan.',
        timerSeconds: 900,
        imagePosition: 'top',
      },
      {
        id: 'langkah-3',
        title: 'Tusuk ayam',
        description:
          'Rendam tusuk sate 15 menit bila menggunakan tusuk kayu. Tusuk 4–5 potong ayam per batang, sisakan sedikit ruang di antara potongan agar panas merata. Susun di atas piring.',
        timerSeconds: 600,
        imagePosition: 'bottom',
      },
      {
        id: 'langkah-4',
        title: 'Panggang pertama',
        description:
          'Panaskan grill atau arang. Panggang sate sambil bolak-balik selama 8 menit. Olesi dengan campuran kecap dan sedikit bumbu kacang pada kedua sisi ketika sate mulai berubah warna.',
        timerSeconds: 480,
        imagePosition: 'center',
      },
      {
        id: 'langkah-5',
        title: 'Olesi & matangkan',
        description:
          'Olesi sate dengan bumbu kacang lebih tebal, lalu panggang lagi sampai gula dalam bumbu berkaramel dan muncul aroma smoky. Jangan membalik terlalu sering; beri waktu sisi sate menyentuh panas.',
        tip: 'Sikat grill dengan minyak sebelum memanggang agar sate tidak menempel.',
        timerSeconds: 420,
        imagePosition: 'bottom',
      },
      {
        id: 'langkah-6',
        title: 'Siapkan sambal kecap',
        description:
          'Iris bawang merah dan cabai rawit. Campur dengan kecap manis, perasan jeruk limau, dan sedikit garam. Aduk sebelum disajikan agar aroma bawang tetap segar.',
        timerSeconds: 300,
        imagePosition: 'top',
      },
      {
        id: 'langkah-7',
        title: 'Sajikan selagi hangat',
        description:
          'Susun sate di piring bersama lontong dan acar. Siram dengan bumbu kacang hangat, taburi bawang goreng, dan sajikan sambal kecap di sampingnya.',
        timerSeconds: 300,
        imagePosition: 'center',
      },
    ],
    tips: [
      'Fillet paha lebih juicy dibanding dada untuk sate.',
      'Kalau memakai tusuk bambu, rendam dulu agar tidak terbakar.',
      'Bumbu kacang bisa dibuat dua hari sebelumnya dan disimpan di kulkas.',
      'Untuk aroma asap tanpa arang, tambahkan sedikit smoked paprika ke bumbu oles.',
    ],
  },
  {
    id: 'soto-betawi',
    title: 'Soto Betawi',
    origin: 'Jakarta',
    tagline: 'Kuah santan gurih dengan aroma rempah yang hangat.',
    description:
      'Soto Betawi adalah perpaduan budaya dalam satu mangkuk: kaldu sapi yang dalam, santan yang lembut, dan rempah seperti kayu manis serta cengkeh. Nikmati dengan emping, sambal, dan nasi putih hangat.',
    image: sotoImage,
    durationMinutes: 90,
    prepMinutes: 25,
    difficulty: 'Sedang',
    servings: 4,
    category: 'Berkuah',
    tags: ['Jakarta', 'Santan', 'Berkuah', 'Keluarga'],
    accent: ['#8A5B17', '#C69238'],
    ingredientGroups: [
      {
        id: 'utama',
        title: 'Isi soto',
        items: [
          { id: 'daging-soto', label: '500 g daging sapi has dalam' },
          {
            id: 'paru',
            label: '150 g paru sapi',
            note: 'opsional, rebus dan goreng',
          },
          { id: 'kentang-soto', label: '2 buah kentang' },
          { id: 'tomat', label: '2 buah tomat merah' },
          { id: 'daun-bawang', label: '2 batang daun bawang' },
          { id: 'bawang-goreng-soto', label: '3 sdm bawang goreng' },
        ],
      },
      {
        id: 'bumbu-soto',
        title: 'Bumbu halus',
        items: [
          { id: 'bawang-merah-soto', label: '8 butir bawang merah' },
          { id: 'bawang-putih-soto', label: '5 siung bawang putih' },
          { id: 'kemiri', label: '4 butir kemiri, sangrai' },
          { id: 'kunyit-soto', label: '2 cm kunyit' },
          { id: 'jahe-soto', label: '2 cm jahe' },
          { id: 'lengkuas-soto', label: '2 cm lengkuas' },
          { id: 'ketumbar-soto', label: '1 sdt ketumbar sangrai' },
          { id: 'merica-soto', label: '½ sdt merica' },
          { id: 'garam-soto', label: '1½ sdt garam' },
        ],
      },
      {
        id: 'kuah',
        title: 'Kuah & aromatik',
        items: [
          { id: 'santan-soto', label: '500 ml santan kental' },
          { id: 'air-soto', label: '1,5 liter air' },
          { id: 'serai-soto', label: '2 batang serai, memarkan' },
          { id: 'daun-salam-soto', label: '3 lembar daun salam' },
          { id: 'daun-jeruk-soto', label: '4 lembar daun jeruk' },
          { id: 'kayu-manis', label: '5 cm kayu manis' },
          { id: 'cengkeh', label: '4 butir cengkeh' },
          { id: 'kapulaga', label: '3 butir kapulaga' },
          { id: 'minyak-soto', label: '3 sdm minyak untuk menumis' },
        ],
      },
      {
        id: 'pelengkap-soto',
        title: 'Pelengkap',
        items: [
          { id: 'emping', label: 'Emping goreng' },
          { id: 'sambal-soto', label: 'Sambal rawit' },
          { id: 'jeruk-soto', label: 'Jeruk nipis' },
          { id: 'nasi-soto', label: 'Nasi putih hangat' },
        ],
      },
    ],
    equipment: [
      { id: 'panci-besar', label: 'Panci besar 4 liter' },
      { id: 'wajan-soto', label: 'Wajan untuk menumis' },
      { id: 'blender-soto', label: 'Blender bumbu' },
      { id: 'saringan', label: 'Saringan kaldu' },
      { id: 'mangkuk-soto', label: 'Mangkuk saji' },
    ],
    steps: [
      {
        id: 'langkah-1',
        title: 'Rebus daging',
        description:
          'Didihkan air, masukkan daging, lalu buang air rebusan pertama. Rebus kembali dengan 1,5 liter air bersama kayu manis, cengkeh, dan kapulaga sampai daging empuk. Angkat daging, saring kaldunya.',
        tip: 'Membuang air rebusan pertama membuat kaldu lebih bersih dan tidak berbau tajam.',
        timerSeconds: 2700,
        imagePosition: 'center',
      },
      {
        id: 'langkah-2',
        title: 'Siapkan kentang',
        description:
          'Kupas kentang, potong wedges, lalu goreng dalam minyak panas sampai keemasan. Tiriskan di atas tisu. Kentang juga bisa direbus bila ingin versi yang lebih ringan.',
        timerSeconds: 600,
        imagePosition: 'bottom',
      },
      {
        id: 'langkah-3',
        title: 'Tumis bumbu halus',
        description:
          'Tumis bumbu halus bersama serai, daun salam, dan daun jeruk hingga harum dan minyak terpisah. Masukkan tumisan ke dalam kaldu daging, aduk rata, lalu didihkan dengan api kecil.',
        timerSeconds: 480,
        imagePosition: 'top',
      },
      {
        id: 'langkah-4',
        title: 'Masak kuah',
        description:
          'Biarkan kuah berarsa 10 menit agar rempah menyatu. Cicipi dan tambahkan garam. Potong daging menjadi irisan tipis atau suwir, lalu masukkan kembali ke kuah.',
        timerSeconds: 600,
        imagePosition: 'center',
      },
      {
        id: 'langkah-5',
        title: 'Masukkan santan',
        description:
          'Kecilkan api, tuang santan kental perlahan sambil diaduk satu arah. Panaskan tanpa sampai mendidih keras agar santan tidak pecah. Matikan api ketika kuah sudah panas dan sedikit mengental.',
        tip: 'Santan yang dipanaskan terlalu cepat akan menggumpal. Aduk terus dengan api kecil.',
        timerSeconds: 900,
        imagePosition: 'bottom',
      },
      {
        id: 'langkah-6',
        title: 'Siapkan isian',
        description:
          'Iris tomat dan daun bawang. Siapkan mangkuk saji, susun daging, kentang, dan paru. Tuang kuah panas, lalu taburi tomat, daun bawang, dan bawang goreng.',
        timerSeconds: 300,
        imagePosition: 'center',
      },
      {
        id: 'langkah-7',
        title: 'Sajikan dengan pelengkap',
        description:
          'Sajikan soto Betawi dengan emping, sambal rawit, perasan jeruk nipis, dan nasi putih. Beri kuah tambahan di mangkuk kecil agar semua orang bisa menyesuaikan porsinya.',
        timerSeconds: 300,
        imagePosition: 'top',
      },
    ],
    tips: [
      'Gunakan api kecil saat memasukkan santan; jangan biarkan kuah mendidih keras.',
      'Kaldu bisa direbus sehari sebelumnya untuk rasa yang lebih dalam.',
      'Jika tidak memakai paru, tambahkan lebih banyak daging atau potongan kentang.',
      'Sajikan segera setelah kuah matang agar aroma rempah masih tajam.',
    ],
  },
  {
    id: 'nasi-goreng',
    title: 'Nasi Goreng Kampung',
    origin: 'Indonesia',
    tagline: 'Cepat, smoky, dan selalu menyelamatkan makan malam.',
    description:
      'Nasi goreng kampung mengandalkan bumbu sederhana: bawang, cabai, terasi, dan kecap. Kunci utamanya adalah nasi dingin yang tidak lembap serta wok yang benar-benar panas agar nasi tidak menempel.',
    image: nasiGorengImage,
    durationMinutes: 25,
    prepMinutes: 10,
    difficulty: 'Mudah',
    servings: 2,
    category: 'Cepat',
    tags: ['Cepat saji', 'Sisa nasi', 'Pedas', 'Makan malam'],
    accent: ['#A8481B', '#DD7E32'],
    ingredientGroups: [
      {
        id: 'utama',
        title: 'Bahan utama',
        items: [
          {
            id: 'nasi',
            label: '400 g nasi putih dingin',
            note: 'masak 4 jam sebelumnya',
          },
          { id: 'telur', label: '2 butir telur' },
          { id: 'ayam-suwi', label: '100 g ayam suwir matang' },
          { id: 'teri', label: '30 g ikan teri medan', note: 'opsional' },
          { id: 'sawi', label: '3 lembar sawi hijau' },
          { id: 'kol', label: '50 g kol, iris tipis' },
        ],
      },
      {
        id: 'bumbu-ng',
        title: 'Bumbu',
        items: [
          { id: 'bawang-merah-ng', label: '5 butir bawang merah' },
          { id: 'bawang-putih-ng', label: '3 siung bawang putih' },
          { id: 'cabai-ng', label: '5 buah cabai rawit merah' },
          { id: 'terasi-ng', label: '½ sdt terasi bakar' },
          { id: 'kecap-ng', label: '2 sdm kecap manis' },
          { id: 'garam-ng', label: '½ sdt garam' },
          { id: 'merica-ng', label: '¼ sdt merica' },
          { id: 'kaldu-ng', label: '½ sdt kaldu jamur' },
        ],
      },
      {
        id: 'pelengkap-ng',
        title: 'Pelengkap',
        items: [
          { id: 'kerupuk-ng', label: 'Kerupuk' },
          { id: 'acar-ng', label: 'Acar timun' },
          { id: 'telur-ceplok', label: '1 butir telur ceplok', note: 'opsional' },
          { id: 'bawang-goreng-ng', label: 'Bawang goreng' },
        ],
      },
    ],
    equipment: [
      { id: 'wok-ng', label: 'Wok atau wajan tebal' },
      { id: 'spatula-ng', label: 'Spatula logam' },
      { id: 'mangkuk-ng', label: 'Mangkuk untuk nasi' },
      { id: 'piring-ng', label: 'Piring saji' },
    ],
    steps: [
      {
        id: 'langkah-1',
        title: 'Siapkan bahan',
        description:
          'Ulek bawang merah, bawang putih, cabai, dan terasi kasar. Iris sawi dan kol. Keringkan nasi dingin dengan cara diaduk pelan agar butirnya terpisah; ini yang membuat nasi goreng tidak menggumpal.',
        tip: 'Nasi yang baru matang mengandung terlalu banyak uap air; dinginkan minimal 2 jam.',
        timerSeconds: 300,
        imagePosition: 'center',
      },
      {
        id: 'langkah-2',
        title: 'Tumis bumbu',
        description:
          'Panaskan wok dengan 3 sdm minyak sampai benar-benar panas. Tumis bumbu kasar sampai harum, sekitar 2 menit. Tambahkan ayam suwir dan teri, aduk hingga ayam berwarna sedikit kecokelatan.',
        timerSeconds: 180,
        imagePosition: 'top',
      },
      {
        id: 'langkah-3',
        title: 'Masukkan telur',
        description:
          'Geser bumbu ke satu sisi wok, masukkan telur, dan orak-arik. Setelah telur setengah matang, aduk bersama bumbu dan ayam. Tambahkan sawi dan kol, masak sampai layu.',
        timerSeconds: 180,
        imagePosition: 'bottom',
      },
      {
        id: 'langkah-4',
        title: 'Masukkan nasi',
        description:
          'Masukkan nasi dingin. Tekan-tekan dengan spatula, lalu aduk cepat dengan api besar. Masukkan kecap manis, garam, merica, dan kaldu jamur. Aduk sampai warna merata.',
        tip: 'Jangan menurunkan api saat menambahkan nasi; panas tinggi mencegah nasi berair.',
        timerSeconds: 240,
        imagePosition: 'center',
      },
      {
        id: 'langkah-5',
        title: 'Keringkan & koreksi rasa',
        description:
          'Biarkan nasi sesaat tanpa diaduk agar bagian bawahnya sedikit karamel dan smoky. Aduk kembali, cicipi, dan tambahkan garam atau kecap bila perlu. Matikan api.',
        timerSeconds: 180,
        imagePosition: 'top',
      },
      {
        id: 'langkah-6',
        title: 'Sajikan',
        description:
          'Sajikan nasi goreng di piring hangat dengan kerupuk, acar timun, dan bawang goreng. Jika suka, tambahkan telur ceplok dengan kuning setengah matang di atasnya.',
        timerSeconds: 120,
        imagePosition: 'center',
      },
    ],
    tips: [
      'Gunakan wok tebal; wok tipis membuat nasi cepat menempel dan gosong.',
      'Terasi bakar memberi aroma yang dalam; lewati bila tidak tersedia.',
      'Sisa nasi dinikmati paling lambat 2 hari setelah dimasak.',
      'Tambahkan daun bawang di akhir agar aromanya tetap segar.',
    ],
  },
  {
    id: 'gado-gado',
    title: 'Gado-Gado Betawi',
    origin: 'Jakarta',
    tagline: 'Sayur renyah, bumbu kacang, dan warna yang ceria.',
    description:
      'Gado-gado Betawi menyatukan sayuran rebus, tahu, tempe, dan telur dengan bumbu kacang yang gurih-manis. Sajikan dengan lontong atau nasi, lalu aduk sampai setiap potong sayur terbalut bumbu.',
    image: gadoGadoImage,
    durationMinutes: 40,
    prepMinutes: 20,
    difficulty: 'Mudah',
    servings: 4,
    category: 'Sayur',
    tags: ['Jakarta', 'Sayur', 'Bumbu kacang', 'Sehat'],
    accent: ['#5F7356', '#9AAE83'],
    ingredientGroups: [
      {
        id: 'sayur',
        title: 'Sayuran',
        items: [
          { id: 'kentang-gg', label: '2 buah kentang' },
          { id: 'wortel-gg', label: '2 buah wortel' },
          { id: 'buncis-gg', label: '150 g buncis' },
          { id: 'kol-gg', label: '150 g kol' },
          { id: 'tauge-gg', label: '150 g tauge' },
          { id: 'timun-gg', label: '1 buah timun' },
          { id: 'selada-gg', label: '1 ikat selada' },
        ],
      },
      {
        id: 'protein',
        title: 'Protein & pelengkap',
        items: [
          { id: 'tahu-gg', label: '4 potong tahu, goreng' },
          { id: 'tempe-gg', label: '150 g tempe, goreng' },
          { id: 'telur-gg', label: '2 butir telur, rebus' },
          { id: 'lontong-gg', label: '2 potong lontong' },
          { id: 'kerupuk-gg', label: 'Kerupuk' },
        ],
      },
      {
        id: 'bumbu-gg',
        title: 'Bumbu kacang',
        items: [
          { id: 'kacang-gg', label: '200 g kacang tanah' },
          { id: 'bawang-putih-gg', label: '3 siung bawang putih' },
          { id: 'cabai-gg', label: '3 buah cabai merah' },
          { id: 'kencur', label: '2 cm kencur' },
          { id: 'gula-jawa-gg', label: '40 g gula merah' },
          { id: 'kecap-gg', label: '3 sdm kecap manis' },
          { id: 'air-gg', label: '250 ml air hangat' },
          { id: 'limau-gg', label: '1 buah jeruk limau' },
          { id: 'garam-gg', label: '1 sdt garam' },
        ],
      },
    ],
    equipment: [
      { id: 'panci-gg', label: 'Panci untuk merebus' },
      { id: 'wajan-gg', label: 'Wajan untuk menggoreng' },
      { id: 'blender-gg', label: 'Blender atau food processor' },
      { id: 'saringan-gg', label: 'Saringan sayur' },
      { id: 'mangkuk-gg', label: 'Mangkuk bumbu' },
    ],
    steps: [
      {
        id: 'langkah-1',
        title: 'Potong sayuran',
        description:
          'Kupas kentang dan wortel, potong sesuai selera. Potong buncis, kol, dan timun. Cuci bersih semua sayuran, lalu kelompokkan sayur yang membutuhkan waktu rebus berbeda.',
        timerSeconds: 600,
        imagePosition: 'top',
      },
      {
        id: 'langkah-2',
        title: 'Blansir sayur',
        description:
          'Didihkan air dengan sedikit garam. Rebus kentang dan wortel 5 menit, lalu buncis dan kol 2 menit. Masukkan tauge di 30 detik terakhir. Angkat, siram air dingin, dan tiriskan agar tetap renyah.',
        tip: 'Air dingin menghentikan proses masak dan menjaga warna sayur tetap cerah.',
        timerSeconds: 360,
        imagePosition: 'center',
      },
      {
        id: 'langkah-3',
        title: 'Goreng tahu & tempe',
        description:
          'Goreng tahu dan tempe dalam minyak panas sampai kuning keemasan. Tiriskan di atas tisu. Tempe bisa digoreng kering, sementara tahu cukup setengah kering agar bagian dalamnya tetap lembut.',
        timerSeconds: 480,
        imagePosition: 'bottom',
      },
      {
        id: 'langkah-4',
        title: 'Rebus telur',
        description:
          'Rebus telur 8 menit untuk kuning yang setengah matang, atau 10 menit bila ingin matang penuh. Rendam di air dingin, kupas, lalu belah dua. Siapkan juga lontong dan kerupuk.',
        timerSeconds: 480,
        imagePosition: 'top',
      },
      {
        id: 'langkah-5',
        title: 'Buat bumbu kacang',
        description:
          'Goreng kacang tanah, lalu haluskan bersama bawang putih, cabai, kencur, dan gula merah. Masak dengan air dan kecap sampai mengental. Beri perasan limau dan garam, cicipi.',
        tip: 'Bumbu kacang gado-gado lebih enak bila teksturnya sedikit kasar.',
        timerSeconds: 600,
        imagePosition: 'center',
      },
      {
        id: 'langkah-6',
        title: 'Tata & sajikan',
        description:
          'Tata selada di piring, susun sayuran, tahu, tempe, telur, dan lontong. Siram bumbu kacang, taburi bawang goreng dan kerupuk. Sajikan segera agar sayur tetap renyah.',
        timerSeconds: 300,
        imagePosition: 'top',
      },
    ],
    tips: [
      'Rebus setiap sayur secara terpisah agar kematangannya merata.',
      'Bumbu kacang bisa diencerkan dengan air hangat bila terlalu kental.',
      'Tambahkan kangkung atau labu siam sesuai isi kulkas.',
      'Simpan bumbu kacang di kulkas hingga 3 hari; hangatkan sebelum disajikan.',
    ],
  },
  {
    id: 'bakso-sapi',
    title: 'Bakso Sapi Solo',
    origin: 'Solo, Jawa Tengah',
    tagline: 'Kenyal, gurih, dengan kuah bening yang menenangkan.',
    description:
      'Bakso Solo yang baik punya tekstur kenyal tetapi tetap juicy. Rahasianya ada pada daging yang sangat dingin, es serut, dan adonan yang tidak dipanaskan selama proses penggilingan. Kuahnya sengaja dibuat bening agar rasa daging terasa jelas.',
    image: baksoImage,
    durationMinutes: 105,
    prepMinutes: 30,
    difficulty: 'Menantang',
    servings: 6,
    category: 'Berkuah',
    tags: ['Solo', 'Berkuah', 'Homemade', 'Akhir pekan'],
    accent: ['#4A6055', '#8D9C87'],
    ingredientGroups: [
      {
        id: 'bakso',
        title: 'Adonan bakso',
        items: [
          {
            id: 'daging-bakso',
            label: '500 g daging sapi giling',
            note: 'dingin, lemak 20%',
          },
          { id: 'es', label: '100 g es serut' },
          { id: 'tapioka', label: '50 g tepung tapioka' },
          { id: 'putih-telur', label: '1 putih telur' },
          { id: 'bawang-putih-goreng', label: '4 siung bawang putih goreng' },
          { id: 'bawang-merah-goreng', label: '3 butir bawang merah goreng' },
          { id: 'garam-bakso', label: '1½ sdt garam' },
          { id: 'merica-bakso', label: '½ sdt merica bubuk' },
          { id: 'baking-powder', label: '½ sdt baking powder' },
        ],
      },
      {
        id: 'kuah-bakso',
        title: 'Kuah',
        items: [
          { id: 'tulang', label: '500 g tulang sapi' },
          { id: 'air-kuah', label: '2 liter air' },
          { id: 'bawang-putih-kuah', label: '5 siung bawang putih, goreng' },
          { id: 'daun-bawang-kuah', label: '2 batang daun bawang' },
          { id: 'seledri', label: '2 batang seledri' },
          { id: 'garam-kuah', label: '1 sdt garam' },
          { id: 'merica-kuah', label: '½ sdt merica' },
          { id: 'kaldu-kuah', label: '1 sdt kaldu sapi' },
        ],
      },
      {
        id: 'pelengkap-bakso',
        title: 'Pelengkap',
        items: [
          { id: 'mi-kuning', label: '200 g mi kuning' },
          { id: 'bihun', label: '100 g bihun, seduh' },
          { id: 'sawi', label: '4 lembar sawi hijau' },
          { id: 'telur-rebus', label: '3 butir telur rebus' },
          { id: 'sambal-bakso', label: 'Sambal rawit' },
          { id: 'kecap-bakso', label: 'Kecap manis' },
          { id: 'jeruk-bakso', label: 'Jeruk nipis' },
          { id: 'bawang-goreng-bakso', label: 'Bawang goreng' },
        ],
      },
    ],
    equipment: [
      { id: 'food-processor-bakso', label: 'Food processor kuat' },
      { id: 'mangkuk-dingin', label: 'Mangkuk besar & es batu' },
      { id: 'panci-bakso', label: 'Panci besar' },
      { id: 'sendok-bakso', label: 'Sendok pembentuk bakso' },
      { id: 'termometer', label: 'Termometer dapur', note: 'opsional' },
    ],
    steps: [
      {
        id: 'langkah-1',
        title: 'Dinginkan daging',
        description:
          'Potong daging kecil-kecil, lalu simpan di freezer 20 menit sampai pinggirnya mulai mengeras tetapi belum beku. Siapkan juga es serut dan mangkuk food processor yang dingin.',
        tip: 'Adonan yang panas akan kehilangan kemampuan mengikat air dan bakso jadi keras.',
        timerSeconds: 1200,
        imagePosition: 'center',
      },
      {
        id: 'langkah-2',
        title: 'Blender adonan',
        description:
          'Blender daging dengan es serut, bawang goreng, garam, merica, dan baking powder sampai halus. Tambahkan putih telur dan tapioka, blender sebentar sampai rata. Jangan overmix.',
        tip: 'Kerjakan dalam dua batch agar food processor tidak panas dan adonan tetap dingin.',
        timerSeconds: 600,
        imagePosition: 'top',
      },
      {
        id: 'langkah-3',
        title: 'Bentuk & rebus bakso',
        description:
          'Didihkan air di panci, kecilkan api hingga hampir tidak bergolak. Bentuk adonan dengan sendok dan tangan, masukkan ke air. Rebus sampai bakso mengapung, lalu angkat dan rendam di air es.',
        tip: 'Air yang terlalu mendidih membuat bakso pecah; jaga suhu sekitar 90 °C.',
        timerSeconds: 1200,
        imagePosition: 'bottom',
      },
      {
        id: 'langkah-4',
        title: 'Rebus kuah',
        description:
          'Rebus tulang sapi dengan air, daun bawang, dan seledri selama 45 menit. Buang kotoran yang muncul. Saring kuah, lalu bumbui dengan bawang putih goreng, garam, merica, dan kaldu.',
        timerSeconds: 2700,
        imagePosition: 'center',
      },
      {
        id: 'langkah-5',
        title: 'Racik kuah',
        description:
          'Didihkan kembali kuah yang sudah disaring. Masukkan bakso dan sawi, masak 3 menit. Cicipi kuah; tambahkan garam atau kaldu bila perlu. Jangan terlalu banyak mengaduk agar kuah tetap bening.',
        timerSeconds: 600,
        imagePosition: 'top',
      },
      {
        id: 'langkah-6',
        title: 'Siapkan pelengkap',
        description:
          'Seduh bihun, rebus mi kuning sebentar, dan rebus telur. Potong sawi dan jeruk nipis. Siapkan sambal rawit serta kecap dalam mangkuk kecil. Tata semua pelengkap di meja.',
        timerSeconds: 600,
        imagePosition: 'center',
      },
      {
        id: 'langkah-7',
        title: 'Panaskan bakso dalam kuah',
        description:
          'Masukkan bakso ke kuah panas sebentar sebelum disajikan agar rasanya menyatu. Jangan merebus terlalu lama karena bakso bisa mengembang dan kehilangan tekstur kenyalnya.',
        timerSeconds: 300,
        imagePosition: 'bottom',
      },
      {
        id: 'langkah-8',
        title: 'Sajikan',
        description:
          'Tata mi, bihun, sawi, dan telur di mangkuk. Tuang bakso dan kuah panas, lalu taburi bawang goreng dan seledri. Sajikan dengan sambal, kecap, dan perasan jeruk nipis.',
        timerSeconds: 300,
        imagePosition: 'center',
      },
    ],
    tips: [
      'Gunakan daging dengan sedikit lemak; daging tanpa lemak membuat bakso kering.',
      'Jangan menggiling daging terlalu lama setelah tapioka masuk.',
      'Bakso yang sudah direbus bisa dibekukan bersama sedikit kuah.',
      'Untuk kuah yang lebih dalam, panggang tulang sapi sebentar sebelum direbus.',
    ],
  },
];

export const featuredRecipe = recipes[0];
export const quickRecipes = recipes.filter(
  (recipe) => recipe.durationMinutes <= 45
);

export const recipeCategories = [
  'Semua',
  'Sapi',
  'Ayam',
  'Berkuah',
  'Cepat',
  'Sayur',
] as const;
