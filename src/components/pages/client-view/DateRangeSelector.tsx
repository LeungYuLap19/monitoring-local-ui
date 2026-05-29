import { useTranslation } from '../../../lib/i18n';
import { Button } from '../../ui/button';

type DatePreset = '1' | '3' | '7';

interface DateRangeSelectorProps {
  value: DatePreset;
  onChange: (value: DatePreset) => void;
}

const PRESETS: DatePreset[] = ['1', '3', '7'];

export default function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const { t } = useTranslation();
  const labels: Record<DatePreset, string> = {
    '1': t('clientView.dateRange.today'),
    '3': t('clientView.dateRange.threeDays'),
    '7': t('clientView.dateRange.sevenDays'),
  };

  return (
    <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl p-1">
      {PRESETS.map((preset) => (
        <Button
          key={preset}
          variant="ghost"
          size="sm"
          onClick={() => onChange(preset)}
          className={`rounded-lg text-xs font-semibold ${
            value === preset
              ? 'bg-white shadow-sm text-teal-700'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {labels[preset]}
        </Button>
      ))}
    </div>
  );
}
