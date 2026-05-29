import React from 'react';
import type { PetListViewProps } from '../../../types';
import { formatPetDate } from '../../../lib/utils/services/pet-service';
import { useTranslation } from '../../../lib/i18n';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';

function getSexLabel(sex: 'male' | 'female' | null, t: ReturnType<typeof useTranslation>['t']): string {
  if (sex === 'male') return t('pets.male');
  if (sex === 'female') return t('pets.female');
  return t('pets.notAvailable');
}

export default function PetListView({ pets, onSelectPet }: PetListViewProps) {
  const { t, locale } = useTranslation();

  return (
    <div id="pets-list-flow" className="overflow-hidden rounded-2xl bg-white shadow-sm select-none">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-black uppercase tracking-wider text-slate-400">
              <th className="px-6 py-4">{t('pets.list.name')}</th>
              <th className="px-6 py-4">{t('pets.list.animalBreed')}</th>
              <th className="px-6 py-4">{t('pets.list.birthdaySex')}</th>
              <th className="px-6 py-4">{t('pets.list.weightLocation')}</th>
              <th className="px-6 py-4">{t('pets.list.status')}</th>
              <th className="px-6 py-4 text-right">{t('pets.list.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
            {pets.map((pet) => (
              <tr key={pet.id} className="transition-shadow hover:shadow-md transition-colors hover:bg-slate-50/50">
                <td className="flex items-center gap-3 px-6 py-4">
                  <div className="size-9 shrink-0 overflow-hidden rounded-xl bg-teal-50">
                    {pet.primaryImageUrl ? (
                      <img src={pet.primaryImageUrl} alt={pet.name} className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center font-black uppercase text-teal-700">
                        {pet.name.substring(0, 2)}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="block text-sm font-extrabold text-slate-800">{pet.name}</span>
                    <span className="block text-[10px] font-bold uppercase text-slate-400">
                      {pet.ngoPetId || pet.id}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="block">{pet.animal || t('pets.notAvailable')}</span>
                  <span className="block text-[10px] text-slate-400">{pet.breed || t('pets.notAvailable')}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="block">{formatPetDate(pet.birthday, locale) || t('pets.notAvailable')}</span>
                  <span className="block text-[10px] text-slate-400">
                    {getSexLabel(pet.sex, t)}
                    {pet.ageYears !== null ? ` · ${pet.ageYears} ${t('pets.ageUnit')}` : ''}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span>{pet.weight !== null ? `${pet.weight} kg` : t('pets.notAvailable')}</span>
                  <span className="block text-[10px] text-slate-400">
                    {pet.location || pet.position || t('pets.notAvailable')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Badge className="border-0 bg-slate-100 text-[10px] font-black uppercase text-slate-700">
                    {pet.status || t('pets.notAvailable')}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="outline" size="xs" onClick={() => onSelectPet(pet.id)}>
                    {t('pets.viewDetails')}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
