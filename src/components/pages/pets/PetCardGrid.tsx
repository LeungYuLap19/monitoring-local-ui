import React from 'react';
import {
  Calendar,
  MapPin,
  Scale,
  ShieldCheck,
  ChevronRight,
  Heart,
} from 'lucide-react';
import type { PetCardGridProps } from '../../../types';
import { formatPetDate } from '../../../lib/utils/services/pet-service';
import { useTranslation } from '../../../lib/i18n';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';

function getSexLabel(sex: 'male' | 'female' | null, t: ReturnType<typeof useTranslation>['t']): string | null {
  if (sex === 'male') return t('pets.male');
  if (sex === 'female') return t('pets.female');
  return null;
}

export default function PetCardGrid({ pets, onSelectPet }: PetCardGridProps) {
  const { t, locale } = useTranslation();

  return (
    <div id="pets-grid-flow" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {pets.map((pet) => {
        const sexLabel = getSexLabel(pet.sex, t);
        const birthdayLabel = formatPetDate(pet.birthday, locale);
        const receivedDateLabel = formatPetDate(pet.receivedDate, locale);

        return (
          <Card
            key={pet.id}
            className="group overflow-hidden rounded-2xl p-0 gap-0 transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-video bg-slate-100">
              {pet.primaryImageUrl ? (
                <img
                  src={pet.primaryImageUrl}
                  alt={pet.name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center bg-slate-950 p-4 font-mono text-[9px] text-slate-500 select-none">
                  <Heart className="mb-1 size-6 text-teal-600 transition-transform group-hover:scale-110" />
                  <span className="text-[8px] font-bold uppercase text-slate-600">{pet.name}</span>
                </div>
              )}
              <Badge className="absolute right-4 top-4 rounded-full border-0 bg-white/90 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-700 shadow-sm">
                {pet.status || t('pets.notAvailable')}
              </Badge>
            </div>

            <CardContent className="flex flex-1 flex-col justify-between space-y-4 p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-extrabold text-slate-800">{pet.name}</h3>
                  {pet.animal ? (
                    <span className="shrink-0 rounded-full bg-teal-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-teal-700">
                      {pet.animal}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs font-bold text-slate-400">
                  {pet.breed || t('pets.notAvailable')}
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3 text-xs font-medium text-slate-550">
                <div className="flex items-center gap-2">
                  <Calendar className="size-3.5 shrink-0 text-slate-400" />
                  <span>
                    {birthdayLabel || t('pets.notAvailable')}
                    {pet.ageYears !== null ? ` · ${pet.ageYears} ${t('pets.ageUnit')}` : ''}
                    {sexLabel ? ` · ${sexLabel}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Scale className="size-3.5 shrink-0 text-slate-400" />
                  <span>
                    {t('pets.weightLabel')} {pet.weight !== null ? `${pet.weight} kg` : t('pets.notAvailable')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-3.5 shrink-0 text-slate-400" />
                  <span>{pet.location || pet.position || t('pets.notAvailable')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-3.5 shrink-0 text-slate-400" />
                  <span>
                    {pet.sterilization === null
                      ? t('pets.notAvailable')
                      : pet.sterilization
                        ? t('pets.sterilized')
                        : t('pets.notSterilized')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-black text-slate-400">
                <span>{receivedDateLabel}</span>
                <Button
                  variant="link"
                  onClick={() => onSelectPet(pet.id)}
                  className="h-auto p-0 text-xs font-bold text-teal-600 hover:text-[#0c857a]"
                >
                  <span>{t('pets.viewDetails')}</span>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
