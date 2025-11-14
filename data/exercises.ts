import type { Exercise, WorkoutExercise } from "@/types/training";

export interface MuscleGroup {
  id: string;
  name: string;
  description: string;
  icon?: string;
  focusTips?: string[];
}

export interface WorkoutTemplate {
  id: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  focus: string;
  description: string;
  durationMinutes: number;
  muscleGroups: string[];
  exercises: WorkoutExercise[];
  recommendedRestSeconds: number;
  notes?: string[];
}

export interface ExerciseDataset {
  version: string;
  updatedAt: string;
  muscleGroups: MuscleGroup[];
  exercises: Exercise[];
  workoutTemplates: WorkoutTemplate[];
}

export const muscleGroups: MuscleGroup[] = [
  {
    id: "chest",
    name: "Грудні м’язи",
    description:
      "Відповідають за поштовхові рухи верхньої частини тіла та стабілізацію плечей.",
    icon: "🫀",
    focusTips: [
      "Тримайте лопатки зведеними, щоб уникнути навантаження на плечі.",
      "Комбінуйте горизонтальні та вертикальні жими для збалансованого розвитку.",
    ],
  },
  {
    id: "back",
    name: "Спина",
    description:
      "М’язи спини формують поставу та відповідають за тягові рухи і стабілізацію корпусу.",
    icon: "🛡️",
    focusTips: [
      "Працюйте над нейтральною позицією хребта у всіх вправах.",
      "Поєднуйте горизонтальні та вертикальні тяги для повного розвитку.",
    ],
  },
  {
    id: "legs",
    name: "Ноги",
    description:
      "Сильні ноги забезпечують стабільність тіла, вибухову силу та витривалість у повсякденних рухах.",
    icon: "🦵",
    focusTips: [
      "Чергуйте вправи на силу та на вибуховість для комплексного розвитку.",
      "Не забувайте про мобільність щиколоток та тазостегнових суглобів.",
    ],
  },
  {
    id: "shoulders",
    name: "Плечі",
    description:
      "Плечовий пояс відповідає за широкий спектр рухів рук і стабілізує верхню частину тіла.",
    icon: "🛶",
    focusTips: [
      "Поєднуйте жими та відведення для опрацювання всіх пучків дельт.",
      "Виконуйте вправи на обертальну манжету для профілактики травм.",
    ],
  },
  {
    id: "arms",
    name: "Руки",
    description:
      "Біцепси та трицепси допомагають виконувати поштовхові й тягові рухи, доповнюючи більші групи.",
    icon: "💪",
    focusTips: [
      "Використовуйте як ізольовані, так і базові вправи для зростання сили.",
      "Контролюйте техніку, щоб уникнути надмірного навантаження на лікті.",
    ],
  },
  {
    id: "core",
    name: "Кор",
    description:
      "М’язи кора відповідають за стабілізацію тулуба та передачу сили між верхом і низом тіла.",
    icon: "🏋️",
    focusTips: [
      "Поєднуйте статичні та динамічні вправи для кращої витривалості.",
      "Слідкуйте за диханням та положенням таза під час виконання.",
    ],
  },
];

export const exercises: Exercise[] = [
  {
    id: "push-ups",
    name: "Віджимання від підлоги",
    description:
      "Базова вправа для розвитку грудних м’язів, трицепсів та передніх дельт.",
    muscleGroups: ["chest", "arms", "shoulders", "core"],
    equipment: "Власна вага",
    defaultSets: 3,
    defaultRepetitions: 12,
  },
  {
    id: "pull-ups",
    name: "Підтягування",
    description:
      "Розвиває широчайші м’язи спини, біцепси та м’язи-стабілізатори.",
    muscleGroups: ["back", "arms", "core"],
    equipment: "Турнік",
    defaultSets: 4,
    defaultRepetitions: 8,
  },
  {
    id: "bodyweight-squat",
    name: "Присідання з власною вагою",
    description:
      "Базова вправа на розвиток сили та витривалості м’язів нижньої частини тіла.",
    muscleGroups: ["legs", "core"],
    equipment: "Власна вага",
    defaultSets: 3,
    defaultRepetitions: 15,
  },
  {
    id: "dumbbell-row",
    name: "Тяга гантелі в нахилі",
    description:
      "Спрямована на розвиток середньої частини спини та задніх дельт.",
    muscleGroups: ["back", "shoulders", "arms", "core"],
    equipment: "Гантелі",
    defaultSets: 3,
    defaultRepetitions: 10,
  },
  {
    id: "plank",
    name: "Планка",
    description: "Ізометрична вправа для зміцнення глибоких м’язів кора.",
    muscleGroups: ["core"],
    equipment: "Килимок",
    defaultSets: 3,
    defaultDurationSeconds: 45,
  },
  {
    id: "overhead-press",
    name: "Жим стоячи",
    description:
      "Розвиває дельтовидні м’язи та трицепси, вимагає стабілізації кора.",
    muscleGroups: ["shoulders", "arms", "core"],
    equipment: "Штанга або гантелі",
    defaultSets: 4,
    defaultRepetitions: 8,
  },
  {
    id: "romanian-deadlift",
    name: "Румунська тяга",
    description:
      "Націлена на задню поверхню стегна, сідниці та м’язи нижньої частини спини.",
    muscleGroups: ["legs", "back", "core"],
    equipment: "Штанга або гантелі",
    defaultSets: 4,
    defaultRepetitions: 10,
  },
  {
    id: "bicycle-crunch",
    name: "Скручування «велосипед»",
    description:
      "Динамічна вправа для косих та прямих м’язів живота, покращує координацію.",
    muscleGroups: ["core"],
    equipment: "Килимок",
    defaultSets: 3,
    defaultRepetitions: 20,
  },
  {
    id: "bench-dip",
    name: "Віджимання на брусах або лаві",
    description:
      "Спрямовані на розвиток трицепсів та нижньої частини грудних м’язів.",
    muscleGroups: ["arms", "chest", "shoulders"],
    equipment: "Бруси або лавка",
    defaultSets: 3,
    defaultRepetitions: 12,
  },
  {
    id: "lunge",
    name: "Випади вперед",
    description:
      "Акцентують роботу квадрицепсів, сідниць та м’язів стабілізаторів.",
    muscleGroups: ["legs", "core"],
    equipment: "Власна вага або гантелі",
    defaultSets: 3,
    defaultRepetitions: 12,
  },
];

const workoutExercises = (items: Array<{
  id: string;
  sets: number;
  repetitions?: number;
  durationSeconds?: number;
  notes?: string;
}>): WorkoutExercise[] =>
  items.map((item) => ({
    exerciseId: item.id,
    sets: item.sets,
    repetitions: item.repetitions,
    durationSeconds: item.durationSeconds,
    notes: item.notes,
  }));

export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: "full-body-foundation",
    title: "Фул-боді база",
    level: "beginner",
    focus: "Загальна підготовка",
    description:
      "Збалансоване тренування для всього тіла, підходить для повернення у тренувальний режим або підтримки форми.",
    durationMinutes: 45,
    muscleGroups: ["legs", "chest", "back", "core"],
    exercises: workoutExercises([
      { id: "bodyweight-squat", sets: 3, repetitions: 15 },
      { id: "push-ups", sets: 3, repetitions: 12 },
      { id: "dumbbell-row", sets: 3, repetitions: 10 },
      { id: "plank", sets: 3, durationSeconds: 45 },
    ]),
    recommendedRestSeconds: 60,
    notes: [
      "Починайте з легкого розігріву 5-7 хвилин.",
      "Сфокусуйтеся на техніці та контролі рухів.",
    ],
  },
  {
    id: "upper-body-strength",
    title: "Сила верхньої частини",
    level: "intermediate",
    focus: "Розвиток грудей, спини та плечей",
    description:
      "Комбінація жимових і тягових вправ для нарощування сили верхньої частини тіла.",
    durationMinutes: 50,
    muscleGroups: ["chest", "back", "shoulders", "arms", "core"],
    exercises: workoutExercises([
      { id: "overhead-press", sets: 4, repetitions: 8 },
      { id: "pull-ups", sets: 4, repetitions: 8, notes: "За потреби використовуйте гуму" },
      { id: "push-ups", sets: 3, repetitions: 15 },
      { id: "plank", sets: 3, durationSeconds: 60 },
    ]),
    recommendedRestSeconds: 75,
    notes: [
      "Збільшуйте вагу у жимі стоячи, якщо виконуєте більше 10 повторень.",
      "Слідкуйте за положенням лопаток під час підтягувань.",
    ],
  },
  {
    id: "lower-body-power",
    title: "Сила та вибуховість ніг",
    level: "intermediate",
    focus: "Нижня частина тіла",
    description:
      "Поєднання тягових та односторонніх вправ для розвитку сили й балансу.",
    durationMinutes: 55,
    muscleGroups: ["legs", "core", "back"],
    exercises: workoutExercises([
      { id: "romanian-deadlift", sets: 4, repetitions: 10 },
      { id: "lunge", sets: 3, repetitions: 12, notes: "Поперемінно на кожну ногу" },
      { id: "bodyweight-squat", sets: 3, repetitions: 20 },
      { id: "plank", sets: 3, durationSeconds: 60 },
    ]),
    recommendedRestSeconds: 90,
    notes: [
      "Не забувайте про розтяжку задньої поверхні стегна після тренування.",
      "Тримайте спину прямою під час тяги.",
    ],
  },
  {
    id: "core-focus",
    title: "Стійкий кор",
    level: "beginner",
    focus: "Стабілізація та витривалість",
    description:
      "Комлекс статичних і динамічних вправ для посилення м’язів кора та профілактики болю в спині.",
    durationMinutes: 30,
    muscleGroups: ["core"],
    exercises: workoutExercises([
      { id: "plank", sets: 4, durationSeconds: 45 },
      { id: "bicycle-crunch", sets: 3, repetitions: 20 },
      { id: "lunge", sets: 3, repetitions: 12 },
    ]),
    recommendedRestSeconds: 45,
    notes: [
      "Під час планки тримайте таз на рівні плечей.",
      "Контролюйте дихання, не затримуйте його в статичних вправах.",
    ],
  },
];

export const exerciseDataset: ExerciseDataset = {
  version: "2024-12-01",
  updatedAt: new Date("2024-12-01T00:00:00.000Z").toISOString(),
  muscleGroups,
  exercises,
  workoutTemplates,
};

export type { MuscleGroup as MuscleGroupSummary };
