/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronDown, Link2 } from 'lucide-react';
import { PetSelectorProps } from '../../../types';
import { useTranslation } from '../../../lib/i18n';
import { Button } from '../../ui/button';

export default function PetSelector({
  selectedPetId,
  setSelectedPetId,
  cameraFeeds,
  onLinkPet,
}: PetSelectorProps) {
  const { t } = useTranslation();
  return (
    <div id="monitoring-breadcrumb" className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 sm:px-6 sm:py-4 rounded-2xl shadow-sm gap-4">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-bold">{t('monitoring.breadcrumb')}</span>
        <span className="text-slate-300">/</span>
        <span className="text-teal-600 font-extrabold uppercase">{t('monitoring.cageDetails')}</span>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="relative">
          <select
            id="active-pet-selector"
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
            className="appearance-none bg-slate-50 rounded-xl px-4 py-1.5 pr-8 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/10 cursor-pointer"
          >
            {cameraFeeds.map((feed) => (
              <option key={feed.id} value={feed.id}>{feed.petName || feed.name}</option>
            ))}
          </select>
          <ChevronDown className="size-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>
        {onLinkPet && (
          <Button variant="outline" size="sm" onClick={onLinkPet} className="gap-1.5">
            <Link2 className="size-3.5" />
            {t('monitoring.linkPet.button')}
          </Button>
        )}
      </div>
    </div>
  );
}
