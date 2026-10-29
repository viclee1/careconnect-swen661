import type { LucideIcon } from 'lucide-react';

import { settingToneClasses, type SettingTone } from './settingTones';

/** The coloured square holding a setting's icon. Decorative: the title says it. */
export default function SettingIcon({ Icon, tone }: { Icon: LucideIcon; tone: SettingTone }) {
  return (
    <span
      className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${settingToneClasses[tone]}`}
      aria-hidden="true"
    >
      <Icon className="w-5 h-5" />
    </span>
  );
}
