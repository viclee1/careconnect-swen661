import type {
  ScheduleItem,
  Medication,
  MemoryCard,
  CaregiverNote,
} from '../types';
import { localISODate } from '../utils/dates';

const TODAY = localISODate();

// ── Daily Schedule ─────────────────────────────────────────────────────────

export const scheduleItems: ScheduleItem[] = [
  { id: 's1', time: '07:30', label: 'Wake up & stretch', category: 'activity', done: true },
  { id: 's2', time: '08:00', label: 'Breakfast', description: 'Oatmeal with berries', category: 'meal', done: true },
  { id: 's3', time: '08:30', label: 'Morning medications', description: 'Take with a full glass of water', category: 'medication', done: true },
  { id: 's4', time: '10:00', label: 'Walk in the garden', description: '20 minutes of fresh air', category: 'activity', done: false },
  { id: 's5', time: '12:00', label: 'Lunch', description: 'Chicken soup and bread roll', category: 'meal', done: false },
  { id: 's6', time: '13:00', label: 'Rest time', description: 'Lie down or read quietly', category: 'rest', done: false },
  { id: 's7', time: '15:00', label: 'Video call with Maria', description: 'Your daughter — she will call you', category: 'appointment', done: false },
  { id: 's8', time: '17:30', label: 'Evening medications', category: 'medication', done: false },
  { id: 's9', time: '18:00', label: 'Dinner', description: 'Pasta with tomato sauce', category: 'meal', done: false },
  { id: 's10', time: '20:30', label: 'Bedtime', description: 'Lights out, good night!', category: 'rest', done: false },
];

// ── Medications ────────────────────────────────────────────────────────────

export const medications: Medication[] = [
  {
    id: 'm1',
    name: 'Amlodipine',
    dosage: '5 mg — 1 tablet',
    times: ['08:30'],
    instructions: 'Take with food.',
    colour: 'bg-calm-200',
    taken: { [TODAY]: true },
  },
  {
    id: 'm2',
    name: 'Atorvastatin',
    dosage: '20 mg — 1 tablet',
    times: ['20:00'],
    instructions: 'Take in the evening.',
    colour: 'bg-warm-200',
    taken: { [TODAY]: false },
  },
  {
    id: 'm3',
    name: 'Sertraline',
    dosage: '50 mg — 1 tablet',
    times: ['08:30'],
    instructions: 'Take with or without food.',
    colour: 'bg-success-200',
    taken: { [TODAY]: true },
  },
  {
    id: 'm4',
    name: 'Vitamin D3',
    dosage: '1000 IU — 1 capsule',
    times: ['08:30'],
    instructions: 'Take with breakfast.',
    colour: 'bg-warning-200',
    taken: { [TODAY]: false },
  },
];

// ── Memory Cards ────────────────────────────────────────────────────────────

export const memoryCards: MemoryCard[] = [
  {
    id: 'mc1',
    title: 'Maria — Your Daughter',
    body: 'Maria lives in Bristol with her husband Tom and your two grandchildren, Ella (8) and James (5). She calls every Tuesday and Sunday afternoon.',
    imageUrl: '/memories/mc1-480.webp',
    imageSrcSet: '/memories/mc1-480.webp 480w, /memories/mc1-800.webp 800w',
    imageAlt: 'A smiling family of four at a table set for tea',
    category: 'family',
    pinned: true,
  },
  {
    id: 'mc2',
    title: 'Your Home',
    body: 'You live at 14 Meadow Lane. The front door key is hanging on the blue hook by the kitchen. Your bedroom is the first door on the left upstairs.',
    imageUrl: '/memories/mc2-480.webp',
    imageSrcSet: '/memories/mc2-480.webp 480w, /memories/mc2-800.webp 800w',
    imageAlt: 'A two-storey house with lit windows at sunset',
    category: 'place',
    pinned: true,
  },
  {
    id: 'mc3',
    title: 'Your Garden',
    body: 'You love spending time in your garden. You grow tomatoes, sweet peas, and sunflowers every summer. Your favourite bench is by the rose bush.',
    imageUrl: '/memories/mc3-480.webp',
    imageSrcSet: '/memories/mc3-480.webp 480w, /memories/mc3-800.webp 800w',
    imageAlt: 'A green potted plant on a wooden shelf',
    category: 'hobby',
    pinned: false,
  },
  {
    id: 'mc4',
    title: 'Buddy — Your Cat',
    body: 'Buddy is a ginger tabby cat, 4 years old. He eats twice a day — morning and evening. His food is in the blue tin under the kitchen sink.',
    imageUrl: '/memories/mc4-480.webp',
    imageSrcSet: '/memories/mc4-480.webp 480w, /memories/mc4-800.webp 800w',
    imageAlt: 'A fluffy white kitten with blue eyes',
    category: 'pet',
    pinned: true,
  },
  {
    id: 'mc5',
    title: '50th Wedding Anniversary',
    body: 'You and Robert celebrated your golden anniversary in June 2018 with a party at the village hall. Over 60 friends and family came to celebrate.',
    imageUrl: '/memories/mc5-480.webp',
    imageSrcSet: '/memories/mc5-480.webp 480w, /memories/mc5-800.webp 800w',
    imageAlt: 'A bride and groom walking along a beach at sunset',
    category: 'event',
    pinned: false,
  },
  {
    id: 'mc6',
    title: 'Favourite Walk — River Path',
    body: 'The river path starts at the end of Meadow Lane. It is a flat, 20-minute loop through the meadow and back. You used to walk it every morning.',
    imageUrl: '/memories/mc6-480.webp',
    imageSrcSet: '/memories/mc6-480.webp 480w, /memories/mc6-800.webp 800w',
    imageAlt: 'A turquoise lake below snow-capped mountains',
    category: 'place',
    pinned: false,
  },
];

// ── Caregiver Notes ─────────────────────────────────────────────────────────

export const caregiverNotes: CaregiverNote[] = [
  {
    id: 'n1',
    date: TODAY,
    author: 'Joyce Adeyemi',
    note: 'Good morning. Dorothy had a restful night. She ate all of her breakfast and took morning meds without difficulty. Mood is cheerful.',
    priority: 'low',
  },
  {
    id: 'n2',
    date: TODAY,
    author: 'Joyce Adeyemi',
    note: 'Dorothy mentioned her left knee is a little sore today. She skipped the garden walk but did 10 minutes of gentle seated exercises instead. Worth noting for the GP review next week.',
    priority: 'medium',
  },
  {
    id: 'n3',
    date: '2026-06-03',
    author: 'Maria Thompson',
    note: "Had a lovely video call with Mum yesterday. She remembered Ella's school play and was asking about the cat. Great day overall.",
    priority: 'low',
  },
  {
    id: 'n4',
    date: '2026-06-02',
    author: 'Joyce Adeyemi',
    note: 'Dorothy was confused about the day of the week this morning and asked for Robert twice. Gently reminded her and she settled quickly. No distress. Monitoring.',
    priority: 'medium',
  },
];
