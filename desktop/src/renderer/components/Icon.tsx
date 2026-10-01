import {
  Accessibility,
  ArrowLeft,
  BellRing,
  Calendar,
  Captions,
  Check,
  CheckCheck,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  CirclePlay,
  Clock,
  Eye,
  HeartPulse,
  House,
  Images,
  Info,
  Keyboard,
  LogOut,
  MessageSquare,
  Pill,
  Printer,
  RefreshCw,
  Search,
  Send,
  Settings,
  Star,
  Stethoscope,
  Sun,
  TriangleAlert,
  User,
  UserX,
  Users,
  UsersRound,
  Vibrate,
  Video,
  Voicemail,
  Volume2,
  X,
  type LucideIcon,
} from 'lucide-react';

/**
 * The icon set, named after what each icon *means* rather than what it looks
 * like, so a page never reaches for a drawing directly.
 */
const icons = {
  accessibility: Accessibility,
  alert: BellRing,
  appointments: Calendar,
  back: ArrowLeft,
  captions: Captions,
  care: Stethoscope,
  check: Check,
  chevronRight: ChevronRight,
  close: X,
  contacts: UsersRound,
  delivered: CheckCheck,
  error: CircleAlert,
  family: Users,
  help: CircleHelp,
  home: House,
  info: Info,
  keyboard: Keyboard,
  logo: HeartPulse,
  medicines: Pill,
  memories: Images,
  message: MessageSquare,
  missingPerson: UserX,
  myDay: Sun,
  person: User,
  play: CirclePlay,
  primary: Star,
  print: Printer,
  read: Eye,
  refresh: RefreshCw,
  search: Search,
  send: Send,
  sending: Clock,
  settings: Settings,
  signOut: LogOut,
  success: CircleCheck,
  video: Video,
  visibility: Eye,
  voicemail: Voicemail,
  volume: Volume2,
  warning: TriangleAlert,
  notify: Vibrate,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

/**
 * An icon.
 *
 * Hidden from assistive technology by default. Every icon in CareConnect sits
 * next to a word that says the same thing, so announcing the icon as well would
 * only make a screen reader stutter. Pass `decorative={false}` in the rare case
 * where an icon carries meaning on its own — and then give it a label.
 *
 * `absoluteStrokeWidth` keeps the stroke from thinning as the icon scales with
 * the user's zoom level, which is the difference between a 200%-zoomed icon
 * that still reads and one that dissolves.
 */
export function Icon({
  name,
  size = 20,
  decorative = true,
  label,
  className,
}: {
  name: IconName;
  size?: number;
  decorative?: boolean;
  label?: string;
  className?: string;
}) {
  const Glyph = icons[name];
  return (
    <Glyph
      className={className}
      size={size}
      strokeWidth={2}
      absoluteStrokeWidth
      aria-hidden={decorative || undefined}
      focusable={false}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
    />
  );
}
