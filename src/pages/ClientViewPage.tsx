import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileDown } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { fetchUserPets } from '../lib/services/petService';
import { getBehaviorSummary, getBehaviorTimeline, getBehaviorEvents } from '../lib/services/behaviorHistoryService';
import { Button } from '../components/ui/button';
import BehaviorSummaryCards from '../components/pages/client-view/BehaviorSummaryCards';
import BehaviorTimelineChart from '../components/pages/client-view/BehaviorTimelineChart';
import BehaviorEventList from '../components/pages/client-view/BehaviorEventList';
import DateRangeSelector from '../components/pages/client-view/DateRangeSelector';
import type { PetMonitorBehaviorTimelineBucket } from '../types/lib/monitoring';

type DatePreset = '1' | '3' | '7';

function getDateRange(preset: DatePreset) {
  const now = new Date();
  const to = now.toISOString();
  const from = new Date(now.getTime() - Number(preset) * 86400000).toISOString();
  return { from, to };
}

function getBucket(preset: DatePreset): PetMonitorBehaviorTimelineBucket {
  if (preset === '1') return '1h';
  return '1d';
}

export default function ClientViewPage() {
  const { t } = useTranslation();
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState<DatePreset>('3');
  const [eventsPage, setEventsPage] = useState(1);

  const { from, to } = useMemo(() => getDateRange(datePreset), [datePreset]);
  const bucket = useMemo(() => getBucket(datePreset), [datePreset]);

  const { data: petsData } = useQuery({
    queryKey: ['pets', 'list'],
    queryFn: () => fetchUserPets({ limit: 100 }),
  });

  const pets = petsData?.pets ?? [];

  useEffect(() => {
    if (!selectedPetId && pets.length > 0) {
      setSelectedPetId(pets[0]._id);
    }
  }, [pets, selectedPetId]);

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['behavior', 'summary', selectedPetId, from, to],
    queryFn: () => getBehaviorSummary(selectedPetId!, from, to),
    enabled: !!selectedPetId,
  });

  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ['behavior', 'timeline', selectedPetId, from, to, bucket],
    queryFn: () => getBehaviorTimeline(selectedPetId!, from, to, bucket),
    enabled: !!selectedPetId,
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['behavior', 'events', selectedPetId, from, to, eventsPage],
    queryFn: () => getBehaviorEvents({ petId: selectedPetId!, from, to, page: eventsPage, limit: 20 }),
    enabled: !!selectedPetId,
  });

  const selectedPet = useMemo(
    () => pets.find((p) => p._id === selectedPetId),
    [pets, selectedPetId],
  );

  const handleExportPdf = useCallback(async () => {
    const el = document.getElementById('pet-report-card');
    if (!el) return;
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');
    const canvas = await html2canvas(el, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    const petName = selectedPet?.name ?? 'pet';
    const dateStr = new Date().toISOString().slice(0, 10);
    pdf.save(`${petName}_activity_report_${dateStr}.pdf`);
  }, [selectedPet]);

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-lg font-extrabold text-slate-800">{t('clientView.title')}</h1>
        <Button onClick={handleExportPdf} variant="outline" size="sm" className="gap-2">
          <FileDown className="size-4" />
          <span>{t('clientView.export')}</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <select
          value={selectedPetId ?? ''}
          onChange={(e) => { setSelectedPetId(e.target.value); setEventsPage(1); }}
          className="text-sm font-semibold bg-white border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
        >
          {pets.map((pet) => (
            <option key={pet._id} value={pet._id}>{pet.name}</option>
          ))}
        </select>
        <DateRangeSelector value={datePreset} onChange={(v) => { setDatePreset(v); setEventsPage(1); }} />
      </div>

      <div id="pet-report-card" className="space-y-6">
        <BehaviorSummaryCards stats={summary?.stats} isLoading={summaryLoading} />
        <BehaviorTimelineChart points={timeline?.points} bucket={bucket} isLoading={timelineLoading} />
        <BehaviorEventList
          events={events?.data}
          pagination={events?.pagination}
          isLoading={eventsLoading}
          page={eventsPage}
          onPageChange={setEventsPage}
        />
      </div>
    </div>
  );
}
