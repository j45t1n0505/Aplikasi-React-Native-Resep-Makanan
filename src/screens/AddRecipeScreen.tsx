import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
  type ScrollViewInstance,
  type TextInputProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { recipeCovers, type RecipeCoverId } from '../data/covers';
import { GlassSurface } from '../components/ui/GlassSurface';
import { PressableScale } from '../components/ui/PressableScale';
import { Chip } from '../components/ui/Chip';
import { useHaptics } from '../hooks/useHaptics';
import type { RootStackParamList } from '../navigation/types';
import { useDapur } from '../providers/DapurProvider';
import {
  colors,
  fonts,
  layout,
  radii,
  shadows,
} from '../theme';
import { timing } from '../theme/motion';
import {
  DIFFICULTIES,
  RECIPE_CATEGORIES,
  type Difficulty,
  type RecipeCategory,
} from '../types/recipe';
import { confirmAction } from '../utils/confirm';
import {
  createCustomRecipe,
  validateCustomRecipeDraft,
  type CustomRecipeDraft,
  type CustomRecipeErrors,
  type CustomRecipeField,
} from '../utils/customRecipe';

type AddRecipeProps = NativeStackScreenProps<RootStackParamList, 'AddRecipe'>;

type DraftItem = { key: string; label: string; note: string };
type DraftStep = {
  key: string;
  title: string;
  description: string;
  tip: string;
  timer: string;
};

let rowSequence = 0;

function nextKey(prefix: string): string {
  rowSequence += 1;
  return `${prefix}-${rowSequence}`;
}

function blankItem(prefix: string): DraftItem {
  return { key: nextKey(prefix), label: '', note: '' };
}

function blankStep(): DraftStep {
  return {
    key: nextKey('langkah'),
    title: '',
    description: '',
    tip: '',
    timer: '',
  };
}

const errorOrder: CustomRecipeField[] = [
  'title',
  'origin',
  'description',
  'duration',
  'servings',
  'ingredients',
  'steps',
];

const fieldSection: Record<CustomRecipeField, string> = {
  title: 'dasar',
  origin: 'dasar',
  description: 'dasar',
  duration: 'detail',
  servings: 'detail',
  ingredients: 'bahan',
  steps: 'langkah',
};

export function AddRecipeScreen({ navigation }: AddRecipeProps) {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const { addCustomRecipe } = useDapur();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [sectionOffsets, setSectionOffsets] = useState<Record<string, number>>(
    {}
  );

  const [title, setTitle] = useState('');
  const [origin, setOrigin] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [coverId, setCoverId] = useState<RecipeCoverId>(recipeCovers[0].id);
  const [category, setCategory] = useState<RecipeCategory>('Ayam');
  const [difficulty, setDifficulty] = useState<Difficulty>('Mudah');
  const [duration, setDuration] = useState('30');
  const [servings, setServings] = useState('4');
  const [tags, setTags] = useState('');
  const [ingredients, setIngredients] = useState<DraftItem[]>([
    blankItem('bahan'),
  ]);
  const [equipment, setEquipment] = useState<DraftItem[]>([
    blankItem('alat'),
  ]);
  const [steps, setSteps] = useState<DraftStep[]>([blankStep()]);
  const [tipsText, setTipsText] = useState('');
  const [errors, setErrors] = useState<CustomRecipeErrors>({});

  const clearError = useCallback((field: CustomRecipeField) => {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  const isDirty =
    title.trim().length > 0 ||
    origin.trim().length > 0 ||
    tagline.trim().length > 0 ||
    description.trim().length > 0 ||
    tags.trim().length > 0 ||
    tipsText.trim().length > 0 ||
    coverId !== recipeCovers[0].id ||
    category !== 'Ayam' ||
    difficulty !== 'Mudah' ||
    duration !== '30' ||
    servings !== '4' ||
    ingredients.some((item) => item.label.trim() || item.note.trim()) ||
    equipment.some((item) => item.label.trim() || item.note.trim()) ||
    steps.some(
      (step) =>
        step.title.trim() ||
        step.description.trim() ||
        step.tip.trim() ||
        step.timer.trim()
    );

  const handleClose = useCallback(() => {
    if (!isDirty) {
      navigation.goBack();
      return;
    }

    haptics.warning();
    confirmAction({
      title: 'Buang resep ini?',
      message:
        'Semua isian yang belum disimpan akan hilang. Kamu bisa menuliskannya lagi nanti.',
      cancelLabel: 'Lanjut menulis',
      confirmLabel: 'Buang',
      destructive: true,
      onConfirm: () => navigation.goBack(),
    });
  }, [haptics, isDirty, navigation]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleClose();
        return true;
      }
    );
    return () => subscription.remove();
  }, [handleClose]);

  const rememberOffset =
    (section: string) => (event: LayoutChangeEvent) => {
      const offset = event.nativeEvent.layout.y;
      setSectionOffsets((current) =>
        current[section] === offset
          ? current
          : { ...current, [section]: offset }
      );
    };

  const updateItem = (
    setter: Dispatch<SetStateAction<DraftItem[]>>,
    key: string,
    patch: Partial<DraftItem>
  ) => {
    setter((rows) =>
      rows.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  };

  const addItem = (
    setter: Dispatch<SetStateAction<DraftItem[]>>,
    prefix: string
  ) => {
    haptics.selection();
    setter((rows) => [...rows, blankItem(prefix)]);
  };

  const removeItem = (
    setter: Dispatch<SetStateAction<DraftItem[]>>,
    key: string
  ) => {
    haptics.soft();
    setter((rows) =>
      rows.length === 1 ? rows : rows.filter((row) => row.key !== key)
    );
  };

  const updateStep = (key: string, patch: Partial<DraftStep>) => {
    setSteps((rows) =>
      rows.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  };

  const handleSave = () => {
    Keyboard.dismiss();

    const draft: CustomRecipeDraft = {
      title,
      origin,
      tagline,
      description,
      coverId,
      category,
      difficulty,
      durationMinutes: Number.parseInt(duration, 10),
      servings: Number.parseInt(servings, 10),
      tags: tags.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean),
      ingredients: ingredients.map((item) => ({
        label: item.label,
        note: item.note,
      })),
      equipment: equipment.map((item) => ({
        label: item.label,
        note: item.note,
      })),
      steps: steps.map((step) => {
        const timerMinutes = Number.parseInt(step.timer, 10);
        return {
          title: step.title,
          description: step.description,
          tip: step.tip,
          timerSeconds:
            Number.isFinite(timerMinutes) && timerMinutes > 0
              ? timerMinutes * 60
              : undefined,
        };
      }),
      tips: tipsText
        .split(/\n/)
        .map((tip) => tip.trim())
        .filter(Boolean),
    };

    const nextErrors = validateCustomRecipeDraft(draft);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      haptics.warning();

      const firstError = errorOrder.find((field) => nextErrors[field]);
      if (firstError) {
        const section = fieldSection[firstError];
        const offset = sectionOffsets[section];
        if (typeof offset === 'number') {
          scrollRef.current?.scrollTo({
            y: Math.max(0, offset - 16),
            animated: true,
          });
        }
      }
      return;
    }

    const recipe = createCustomRecipe(draft);
    addCustomRecipe(recipe);
    haptics.success();
    navigation.replace('RecipeDetail', { recipeId: recipe.id });
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#F7E4DA', colors.background, colors.background]}
        locations={[0, 0.38, 1]}
        style={styles.background}
      />
      <View pointerEvents="none" style={styles.decorOne} />
      <View pointerEvents="none" style={styles.decorTwo} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + 10,
              paddingBottom: Math.max(insets.bottom, 16) + 156,
            },
          ]}
        >
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={timing({ duration: 460 })}
            style={styles.inner}
          >
            <View style={styles.header}>
              <PressableScale
                onPress={handleClose}
                accessibilityRole="button"
                accessibilityLabel="Tutup form resep"
                style={styles.closeButton}
                scaleTo={0.92}
              >
                <GlassSurface
                  tone="strong"
                  radius={23}
                  style={StyleSheet.absoluteFill}
                />
                <Ionicons name="close" size={21} color={colors.ink} />
              </PressableScale>
              <View style={styles.headerBadge}>
                <Ionicons name="create-outline" size={12} color={colors.primary} />
                <Text style={styles.headerBadgeText}>RESEP BARU</Text>
              </View>
            </View>

            <View style={styles.titleBlock}>
              <Text style={styles.kicker}>TULIS RESEP</Text>
              <Text style={styles.title} accessibilityRole="header">
                Masakan{'\n'}
                <Text style={styles.titleAccent}>keluargamu.</Text>
              </Text>
              <Text style={styles.subtitle}>
                Simpan resep andalanmu supaya bisa dimasak lagi kapan saja,
                lengkap dengan timer dan checklist.
              </Text>
            </View>

            <FormSection
              kicker="FOTO SAMPUL"
              title="Pilih suasana hidangan"
              icon="image-outline"
              delay={80}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.coverRow}
              >
                {recipeCovers.map((cover, index) => {
                  const selected = cover.id === coverId;
                  return (
                    <MotiView
                      key={cover.id}
                      from={{ opacity: 0, translateY: 10 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={timing({ duration: 340, delay: 120 + index * 35 })}
                    >
                      <PressableScale
                        onPress={() => {
                          haptics.selection();
                          setCoverId(cover.id);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`Pilih foto ${cover.label}`}
                        accessibilityState={{ selected }}
                        style={[
                          styles.coverOption,
                          selected && styles.coverOptionSelected,
                        ]}
                        scaleTo={0.95}
                      >
                        <Image
                          source={cover.image}
                          style={StyleSheet.absoluteFill}
                          contentFit="cover"
                          transition={180}
                        />
                        <LinearGradient
                          colors={[
                            'rgba(23, 11, 9, 0)',
                            'rgba(23, 11, 9, 0.72)',
                          ]}
                          style={StyleSheet.absoluteFill}
                        />
                        {selected ? (
                          <MotiView
                            from={{ opacity: 0, scale: 0.4 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={timing({ duration: 220 })}
                            style={styles.coverCheck}
                          >
                            <Ionicons
                              name="checkmark"
                              size={13}
                              color={colors.white}
                            />
                          </MotiView>
                        ) : null}
                        <Text style={styles.coverLabel}>{cover.label}</Text>
                      </PressableScale>
                    </MotiView>
                  );
                })}
              </ScrollView>
              <Text style={styles.hint}>
                Foto bawaan aplikasi, jadi resepmu tetap bisa dibuka tanpa
                internet.
              </Text>
            </FormSection>

            <FormSection
              kicker="KENALAN DULU"
              title="Tentang resepmu"
              icon="restaurant-outline"
              delay={140}
              onLayout={rememberOffset('dasar')}
            >
              <Field
                label="Nama resep"
                value={title}
                onChangeText={(value) => {
                  setTitle(value);
                  clearError('title');
                }}
                placeholder="Misalnya: Ayam kecap ibu"
                error={errors.title}
                maxLength={90}
                autoCapitalize="words"
              />
              <Field
                label="Daerah atau dapur asal"
                value={origin}
                onChangeText={(value) => {
                  setOrigin(value);
                  clearError('origin');
                }}
                placeholder="Misalnya: Dapur rumah, Bandung"
                error={errors.origin}
                maxLength={70}
                autoCapitalize="words"
              />
              <Field
                label="Tagline"
                value={tagline}
                onChangeText={setTagline}
                placeholder="Satu kalimat yang bikin lapar"
                maxLength={140}
              />
              <Field
                label="Cerita singkat"
                value={description}
                onChangeText={(value) => {
                  setDescription(value);
                  clearError('description');
                }}
                placeholder="Apa yang membuat resep ini istimewa?"
                error={errors.description}
                maxLength={1500}
                multiline
                minHeight={92}
              />
            </FormSection>

            <FormSection
              kicker="RASA & WAKTU"
              title="Atur porsinya"
              icon="options-outline"
              delay={200}
              onLayout={rememberOffset('detail')}
            >
              <Text style={styles.fieldLabel}>Kategori</Text>
              <View style={styles.chipRow}>
                {RECIPE_CATEGORIES.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    selected={category === item}
                    onPress={() => {
                      haptics.selection();
                      setCategory(item);
                    }}
                  />
                ))}
              </View>

              <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>
                Tingkat kesulitan
              </Text>
              <View style={styles.chipRow}>
                {DIFFICULTIES.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    selected={difficulty === item}
                    onPress={() => {
                      haptics.selection();
                      setDifficulty(item);
                    }}
                  />
                ))}
              </View>

              <View style={styles.twoColumns}>
                <View style={styles.flex}>
                  <Field
                    label="Total waktu"
                    value={duration}
                    onChangeText={(value) => {
                      setDuration(value.replace(/[^0-9]/g, ''));
                      clearError('duration');
                    }}
                    placeholder="30"
                    keyboardType="number-pad"
                    suffix="menit"
                    error={errors.duration}
                    maxLength={4}
                  />
                </View>
                <View style={styles.flex}>
                  <Field
                    label="Hasil"
                    value={servings}
                    onChangeText={(value) => {
                      setServings(value.replace(/[^0-9]/g, ''));
                      clearError('servings');
                    }}
                    placeholder="4"
                    keyboardType="number-pad"
                    suffix="porsi"
                    error={errors.servings}
                    maxLength={2}
                  />
                </View>
              </View>

              <Field
                label="Tag pencarian"
                value={tags}
                onChangeText={setTags}
                placeholder="pedas, manis, akhir pekan"
                maxLength={160}
                hint="Pisahkan dengan koma. Boleh dikosongkan."
              />
            </FormSection>

            <FormSection
              kicker="SIAPKAN"
              title="Bahan-bahan"
              icon="leaf-outline"
              delay={260}
              onLayout={rememberOffset('bahan')}
            >
              {ingredients.map((item, index) => (
                <MotiView
                  key={item.key}
                  from={{ opacity: 0, translateY: 8 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={timing({ duration: 300, delay: 40 })}
                >
                  <ItemRow
                    index={index}
                    item={item}
                    labelPlaceholder="Nama bahan, mis. 250 g ayam"
                    notePlaceholder="Catatan, mis. potong dadu"
                    canRemove={ingredients.length > 1}
                    onChangeLabel={(value) => {
                      updateItem(setIngredients, item.key, { label: value });
                      clearError('ingredients');
                    }}
                    onChangeNote={(value) =>
                      updateItem(setIngredients, item.key, { note: value })
                    }
                    onRemove={() => removeItem(setIngredients, item.key)}
                  />
                </MotiView>
              ))}
              {errors.ingredients ? (
                <Text style={styles.errorText}>{errors.ingredients}</Text>
              ) : null}
              <AddRowButton
                label="Tambah bahan"
                onPress={() => {
                  clearError('ingredients');
                  addItem(setIngredients, 'bahan');
                }}
              />
            </FormSection>

            <FormSection
              kicker="PERLENGKAPAN"
              title="Peralatan"
              icon="construct-outline"
              delay={320}
            >
              {equipment.map((item, index) => (
                <MotiView
                  key={item.key}
                  from={{ opacity: 0, translateY: 8 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={timing({ duration: 300, delay: 40 })}
                >
                  <ItemRow
                    index={index}
                    item={item}
                    labelPlaceholder="Nama alat, mis. wajan tebal"
                    notePlaceholder="Catatan, mis. 28 cm"
                    canRemove={equipment.length > 1}
                    onChangeLabel={(value) =>
                      updateItem(setEquipment, item.key, { label: value })
                    }
                    onChangeNote={(value) =>
                      updateItem(setEquipment, item.key, { note: value })
                    }
                    onRemove={() => removeItem(setEquipment, item.key)}
                  />
                </MotiView>
              ))}
              <AddRowButton
                label="Tambah alat"
                onPress={() => addItem(setEquipment, 'alat')}
              />
            </FormSection>

            <FormSection
              kicker="PANDUAN"
              title="Langkah memasak"
              icon="list-outline"
              delay={380}
              onLayout={rememberOffset('langkah')}
            >
              {steps.map((step, index) => (
                <MotiView
                  key={step.key}
                  from={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={timing({ duration: 320, delay: 40 })}
                >
                  <StepRow
                    index={index}
                    step={step}
                    canRemove={steps.length > 1}
                    onChange={(patch) => {
                      updateStep(step.key, patch);
                      clearError('steps');
                    }}
                    onRemove={() => {
                      haptics.soft();
                      setSteps((rows) =>
                        rows.length === 1
                          ? rows
                          : rows.filter((row) => row.key !== step.key)
                      );
                    }}
                  />
                </MotiView>
              ))}
              {errors.steps ? (
                <Text style={styles.errorText}>{errors.steps}</Text>
              ) : null}
              <AddRowButton
                label="Tambah langkah"
                onPress={() => {
                  clearError('steps');
                  haptics.selection();
                  setSteps((rows) => [...rows, blankStep()]);
                }}
              />
            </FormSection>

            <FormSection
              kicker="CATATAN DAPUR"
              title="Tips kecil"
              icon="bulb-outline"
              delay={440}
            >
              <Field
                label="Tips (satu baris satu tips)"
                value={tipsText}
                onChangeText={setTipsText}
                placeholder={
                  'Aduk sesekali agar tidak lengket.\nSajikan selagi hangat.'
                }
                multiline
                minHeight={92}
                maxLength={1200}
                hint="Boleh dikosongkan."
              />
            </FormSection>
          </MotiView>
        </ScrollView>

        <View
          style={[
            styles.saveDock,
            { paddingBottom: Math.max(insets.bottom, 10) + 4 },
          ]}
        >
          <LinearGradient
            pointerEvents="none"
            colors={[
              'rgba(250, 245, 239, 0)',
              'rgba(250, 245, 239, 0.9)',
              colors.background,
            ]}
            locations={[0, 0.4, 1]}
            style={styles.saveFade}
          />
          <MotiView
            from={{ opacity: 0, translateY: 18 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={timing({ duration: 420, delay: 260 })}
          >
            <PressableScale
              onPress={handleSave}
              accessibilityRole="button"
              accessibilityLabel="Simpan resep"
              scaleTo={0.98}
              style={styles.saveShadow}
            >
              <LinearGradient
                colors={[colors.primary, '#981920', colors.primaryDeep]}
                locations={[0, 0.58, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.saveIcon}>
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              </View>
              <View style={styles.saveCopy}>
                <Text style={styles.saveTitle}>Simpan resep</Text>
                <Text style={styles.saveSubtitle}>
                  Tersimpan lokal di perangkat ini
                </Text>
              </View>
              <Ionicons
                name="arrow-forward"
                size={18}
                color="rgba(255, 244, 233, 0.9)"
              />
            </PressableScale>
          </MotiView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function FormSection({
  kicker,
  title,
  icon,
  delay,
  children,
  onLayout,
}: {
  kicker: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  delay: number;
  children: ReactNode;
  onLayout?: (event: LayoutChangeEvent) => void;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={timing({ duration: 420, delay })}
      onLayout={onLayout}
      style={styles.section}
    >
      <GlassSurface
        tone="strong"
        radius={radii.xl}
        contentStyle={styles.sectionContent}
        style={styles.sectionShadow}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Ionicons name={icon} size={17} color={colors.primary} />
          </View>
          <View style={styles.sectionTitleWrap}>
            <Text style={styles.sectionKicker}>{kicker}</Text>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        </View>
        <View style={styles.sectionBody}>{children}</View>
      </GlassSurface>
    </MotiView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  suffix,
  multiline,
  minHeight,
  maxLength,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  suffix?: string;
  multiline?: boolean;
  minHeight?: number;
  maxLength?: number;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View
        style={[
          styles.inputShell,
          multiline && styles.inputShellMultiline,
          multiline && { minHeight: minHeight ?? 88 },
          error ? styles.inputShellError : undefined,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.inkFaint}
          selectionColor={colors.primary}
          multiline={multiline}
          maxLength={maxLength}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            suffix ? styles.inputWithSuffix : undefined,
          ]}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {suffix ? <Text style={styles.inputSuffix}>{suffix}</Text> : null}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

function ItemRow({
  index,
  item,
  labelPlaceholder,
  notePlaceholder,
  canRemove,
  onChangeLabel,
  onChangeNote,
  onRemove,
}: {
  index: number;
  item: DraftItem;
  labelPlaceholder: string;
  notePlaceholder: string;
  canRemove: boolean;
  onChangeLabel: (value: string) => void;
  onChangeNote: (value: string) => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemIndex}>
        <Text style={styles.itemIndexText}>{index + 1}</Text>
      </View>
      <View style={styles.itemFields}>
        <TextInput
          value={item.label}
          onChangeText={onChangeLabel}
          placeholder={labelPlaceholder}
          placeholderTextColor={colors.inkFaint}
          selectionColor={colors.primary}
          maxLength={120}
          style={styles.itemInput}
        />
        <TextInput
          value={item.note}
          onChangeText={onChangeNote}
          placeholder={notePlaceholder}
          placeholderTextColor={colors.inkFaint}
          selectionColor={colors.primary}
          maxLength={160}
          style={[styles.itemInput, styles.itemNoteInput]}
        />
      </View>
      {canRemove ? (
        <PressableScale
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`Hapus baris ${index + 1}`}
          style={styles.removeRow}
          scaleTo={0.88}
        >
          <Ionicons name="close" size={15} color={colors.primary} />
        </PressableScale>
      ) : null}
    </View>
  );
}

function StepRow({
  index,
  step,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number;
  step: DraftStep;
  canRemove: boolean;
  onChange: (patch: Partial<DraftStep>) => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>{String(index + 1).padStart(2, '0')}</Text>
        </View>
        <Text style={styles.stepLabel}>LANGKAH {index + 1}</Text>
        {canRemove ? (
          <PressableScale
            onPress={onRemove}
            accessibilityRole="button"
            accessibilityLabel={`Hapus langkah ${index + 1}`}
            style={styles.removeRow}
            scaleTo={0.88}
          >
            <Ionicons name="trash-outline" size={14} color={colors.primary} />
          </PressableScale>
        ) : null}
      </View>

      <TextInput
        value={step.title}
        onChangeText={(value) => onChange({ title: value })}
        placeholder="Judul langkah, mis. Tumis bumbu"
        placeholderTextColor={colors.inkFaint}
        selectionColor={colors.primary}
        maxLength={90}
        style={styles.stepTitleInput}
      />
      <TextInput
        value={step.description}
        onChangeText={(value) => onChange({ description: value })}
        placeholder="Jelaskan caranya dengan jelas..."
        placeholderTextColor={colors.inkFaint}
        selectionColor={colors.primary}
        multiline
        maxLength={1500}
        textAlignVertical="top"
        style={styles.stepDescriptionInput}
      />

      <View style={styles.stepFooter}>
        <View style={styles.timerField}>
          <Ionicons name="timer-outline" size={14} color={colors.primary} />
          <TextInput
            value={step.timer}
            onChangeText={(value) =>
              onChange({ timer: value.replace(/[^0-9]/g, '') })
            }
            placeholder="0"
            placeholderTextColor={colors.inkFaint}
            selectionColor={colors.primary}
            keyboardType="number-pad"
            maxLength={4}
            style={styles.timerInput}
          />
          <Text style={styles.timerSuffix}>menit</Text>
        </View>
      </View>

      <TextInput
        value={step.tip}
        onChangeText={(value) => onChange({ tip: value })}
        placeholder="Catatan langkah (opsional)"
        placeholderTextColor={colors.inkFaint}
        selectionColor={colors.primary}
        maxLength={400}
        style={[styles.stepTipInput]}
      />
    </View>
  );
}

function AddRowButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.addRowButton}
      scaleTo={0.97}
    >
      <Ionicons name="add" size={16} color={colors.primary} />
      <Text style={styles.addRowText}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  decorOne: {
    position: 'absolute',
    top: -120,
    right: -95,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(180, 35, 42, 0.06)',
  },
  decorTwo: {
    position: 'absolute',
    top: 260,
    left: -90,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(197, 139, 77, 0.055)',
  },
  scroll: {
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 760,
    paddingHorizontal: layout.screenPadding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadge: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: colors.primaryWhisper,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(180, 35, 42, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  headerBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 8.5,
    letterSpacing: 1.2,
    color: colors.primary,
  },
  titleBlock: {
    marginTop: 22,
    gap: 6,
  },
  kicker: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    letterSpacing: 1.5,
    color: colors.primary,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: -0.9,
    color: colors.ink,
  },
  titleAccent: {
    fontFamily: fonts.displayItalic,
    color: colors.primary,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 20,
    color: colors.inkSoft,
    maxWidth: 330,
    marginTop: 2,
  },
  section: {
    marginTop: 22,
  },
  sectionShadow: {
    width: '100%',
    ...shadows.soft,
  },
  sectionContent: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryWhisper,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(180, 35, 42, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleWrap: {
    flex: 1,
    gap: 2,
  },
  sectionKicker: {
    fontFamily: fonts.bold,
    fontSize: 8,
    letterSpacing: 1.4,
    color: colors.primary,
  },
  sectionTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 20,
    lineHeight: 25,
    color: colors.ink,
  },
  sectionBody: {
    marginTop: 14,
    gap: 12,
  },
  coverRow: {
    gap: 9,
    paddingRight: 4,
  },
  coverOption: {
    width: 92,
    height: 116,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.ink,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  coverOptionSelected: {
    borderColor: colors.primary,
  },
  coverCheck: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverLabel: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: colors.white,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 15,
    color: colors.inkFaint,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    letterSpacing: 0.2,
    color: colors.inkSoft,
  },
  fieldLabelSpaced: {
    marginTop: 4,
  },
  inputShell: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineStrong,
    backgroundColor: 'rgba(255, 253, 249, 0.86)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  inputShellMultiline: {
    alignItems: 'stretch',
  },
  inputShellError: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryWhisper,
  },
  input: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.ink,
    paddingVertical: 10,
  },
  inputMultiline: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  inputWithSuffix: {
    paddingRight: 6,
  },
  inputSuffix: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: colors.inkMuted,
  },
  errorText: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    lineHeight: 14,
    color: colors.primary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  twoColumns: {
    flexDirection: 'row',
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    padding: 9,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 253, 249, 0.68)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  itemIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
  },
  itemIndexText: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    color: colors.primary,
  },
  itemFields: {
    flex: 1,
    gap: 2,
  },
  itemInput: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.ink,
    paddingVertical: 7,
  },
  itemNoteInput: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: colors.inkMuted,
    paddingTop: 0,
  },
  removeRow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryWhisper,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  stepCard: {
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 253, 249, 0.7)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    gap: 4,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  stepNumber: {
    height: 22,
    minWidth: 30,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  stepLabel: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 8,
    letterSpacing: 1.3,
    color: colors.inkMuted,
  },
  stepTitleInput: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 19,
    color: colors.ink,
    paddingVertical: 5,
  },
  stepDescriptionInput: {
    minHeight: 66,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 18,
    color: colors.inkSoft,
    paddingVertical: 6,
  },
  stepFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timerField: {
    height: 32,
    paddingHorizontal: 9,
    borderRadius: 16,
    backgroundColor: colors.primaryWhisper,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timerInput: {
    minWidth: 24,
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.primary,
    paddingVertical: 4,
    textAlign: 'center',
  },
  timerSuffix: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: colors.inkMuted,
  },
  stepTipInput: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: colors.inkMuted,
    paddingVertical: 4,
  },
  addRowButton: {
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(180, 35, 42, 0.2)',
    borderStyle: 'dashed',
    backgroundColor: colors.primaryWhisper,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  addRowText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.primary,
  },
  saveDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    elevation: 20,
    paddingHorizontal: layout.screenPadding,
  },
  saveFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },
  saveShadow: {
    maxWidth: 760,
    alignSelf: 'center',
    width: '100%',
    height: 64,
    borderRadius: 24,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 12,
    ...shadows.red,
  },
  saveIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveCopy: {
    flex: 1,
    gap: 1,
  },
  saveTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    letterSpacing: -0.1,
    color: colors.white,
  },
  saveSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: 'rgba(255, 240, 229, 0.7)',
  },
});
