import { Alert, Platform } from 'react-native';

type ConfirmActionOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
};

/**
 * Konfirmasi dua tombol yang bekerja di native dan web.
 *
 * `Alert.alert` adalah no-op di react-native-web, sehingga tanpa fallback ini
 * tombol keluar Cooking Mode / reset data tidak melakukan apa pun saat aplikasi
 * dibuka di browser. Di iOS dan Android perilakunya tetap Alert native.
 */
export function confirmAction({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Batal',
  destructive = false,
  onConfirm,
}: ConfirmActionOptions) {
  if (Platform.OS === 'web') {
    const confirmFn =
      typeof globalThis !== 'undefined'
        ? (globalThis as { confirm?: (prompt: string) => boolean }).confirm
        : undefined;

    // Kalau browser memblokir dialog (mis. iframe tanpa izin), jangan sampai
    // pengguna terjebak: anggap tindakan disetujui.
    const accepted = confirmFn
      ? confirmFn(`${title}\n\n${message}`)
      : true;

    if (accepted) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: cancelLabel, style: 'cancel' },
    {
      text: confirmLabel,
      style: destructive ? 'destructive' : 'default',
      onPress: onConfirm,
    },
  ]);
}
