/** Background and icon colours for the square tile beside each setting. */
export type SettingTone = 'warm' | 'calm' | 'success' | 'alert' | 'violet';

export const settingToneClasses: Record<SettingTone, string> = {
  warm: 'bg-warm-100 text-warm-800',
  calm: 'bg-calm-50 text-calm-700',
  success: 'bg-success-50 text-success-700',
  alert: 'bg-alert-50 text-alert-700',
  violet: 'bg-[#efe9fd] text-[#5b3aa6]',
};
