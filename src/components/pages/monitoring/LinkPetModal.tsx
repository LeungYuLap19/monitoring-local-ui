import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link2, Link2Off, Search, ArrowUpDown } from 'lucide-react';
import { useUserPets } from '../../../hooks/pet/useUserPets';
import { useTranslation } from '../../../lib/i18n';
import { toPetManagementListItem } from '../../../lib/utils/services/pet-service';
import type { CameraPetMap } from '../../../hooks/pet/useCameraPetMap';
import type { PetProfileListSortBy, PetProfileSortOrder } from '../../../types';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../ui/dialog';

interface LinkPetModalProps {
  activeDeviceId: string;
  activeCameraName: string;
  cameraPetMap: CameraPetMap;
  onLink: (petId: string, petAnimal?: string | null) => void;
  onUnlink: (petId: string) => void;
  isUpdating: boolean;
  onClose: () => void;
}

const PAGE_SIZE = 10;

export default function LinkPetModal({
  activeDeviceId,
  activeCameraName,
  cameraPetMap,
  onLink,
  onUnlink,
  isUpdating,
  onClose,
}: LinkPetModalProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<PetProfileListSortBy>('updatedAt');
  const [sortOrder, setSortOrder] = useState<PetProfileSortOrder>('desc');

  const { pets: rawPets, pagination, isLoading, loadPets } = useUserPets({
    autoLoad: false,
    initialQuery: { page: 1, limit: PAGE_SIZE, sortBy: 'updatedAt', sortOrder: 'desc' },
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPets({
        page: 1,
        limit: PAGE_SIZE,
        search: searchTerm.trim() || undefined,
        sortBy,
        sortOrder,
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [loadPets, searchTerm, sortBy, sortOrder]);

  const pets = useMemo(
    () => rawPets.map(toPetManagementListItem).filter((p) => p !== null),
    [rawPets],
  );

  const petLinkedToThisCamera = useMemo(
    () => cameraPetMap[activeDeviceId] ?? null,
    [cameraPetMap, activeDeviceId],
  );

  const getCameraForPet = useCallback((petId: string) => {
    for (const [deviceId, info] of Object.entries(cameraPetMap)) {
      if (info.petId === petId) return { deviceId, isThisCamera: deviceId === activeDeviceId };
    }
    return null;
  }, [cameraPetMap, activeDeviceId]);

  const handlePageChange = useCallback((page: number) => {
    void loadPets({ page, limit: PAGE_SIZE, search: searchTerm.trim() || undefined, sortBy, sortOrder });
  }, [loadPets, searchTerm, sortBy, sortOrder]);

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg p-0 max-h-[85vh] flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <DialogTitle className="text-base font-black text-slate-800 flex items-center gap-2">
            <Link2 className="size-5 text-teal-600" />
            <span>{t('monitoring.linkPet.title')}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 mt-0.5">
            {t('monitoring.linkPet.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-3 border-b border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('monitoring.linkPet.searchPlaceholder')}
              className="pl-9 py-2 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="size-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as PetProfileListSortBy)}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="updatedAt">{t('pets.sort.updatedAt')}</option>
              <option value="name">{t('pets.sort.name')}</option>
              <option value="createdAt">{t('pets.sort.createdAt')}</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as PetProfileSortOrder)}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="desc">{t('pets.sort.desc')}</option>
              <option value="asc">{t('pets.sort.asc')}</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-3">
          {isLoading && pets.length === 0 ? (
            <div className="py-8 text-center text-xs font-semibold text-slate-400">...</div>
          ) : pets.length === 0 ? (
            <div className="py-8 text-center text-xs font-semibold text-slate-400">
              {t('monitoring.linkPet.empty')}
            </div>
          ) : (
            <div className="space-y-2">
              {pets.map((pet) => {
                const linked = getCameraForPet(pet.id);
                const isLinkedHere = linked?.isThisCamera ?? false;
                return (
                  <div key={pet.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 hover:bg-slate-50/70 transition-colors">
                    <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-teal-50">
                      {pet.primaryImageUrl ? (
                        <img src={pet.primaryImageUrl} alt={pet.name} className="size-full object-cover" />
                      ) : (
                        <div className="flex size-full items-center justify-center text-xs font-black text-teal-700">
                          {pet.name.substring(0, 2)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{pet.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {isLinkedHere
                          ? t('monitoring.linkPet.linkedHere')
                          : linked
                            ? t('monitoring.linkPet.linkedTo', { camera: linked.deviceId })
                            : t('monitoring.linkPet.notLinked')}
                      </p>
                    </div>
                    {isLinkedHere ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => onUnlink(pet.id)}
                        className="gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50"
                      >
                        <Link2Off className="size-3.5" />
                        {t('monitoring.linkPet.disconnect')}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => onLink(pet.id, pet.animal)}
                        className="gap-1.5"
                      >
                        <Link2 className="size-3.5" />
                        {t('monitoring.linkPet.connect')}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{pagination.page} / {pagination.totalPages}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                &larr;
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                &rarr;
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}