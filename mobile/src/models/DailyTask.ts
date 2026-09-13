import type { IconName } from '../components/Icon';

export interface DailyTask {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  icon: IconName;
  isDone: boolean;
}
