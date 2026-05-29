import React from 'react';
import { Search, LayoutGrid, List, ArrowUpDown } from 'lucide-react';
import { PetSearchBarProps } from '../../../types';
import { useTranslation } from '../../../lib/i18n';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

export default function PetSearchBar({
  searchTerm,
  onSearchChange,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  viewMode,
  onSetViewMode,
}: PetSearchBarProps) {
  const { t } = useTranslation();
  return (
    <div id="pets-list-view-header" className="space-y-6">
      <div className="flex flex-col justify-between items-start gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            {t('pets.heading')}
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {t('pets.description')}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative w-full lg:flex-1">
            <Search className="absolute left-3.5 top-3 size-4 text-slate-400" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('pets.searchPlaceholder')}
              className="pl-10 pr-4 py-2.5"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="size-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">{t('pets.sortByLabel')}</span>
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value as PetSearchBarProps['sortBy'])}
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/15"
              >
                <option value="updatedAt">{t('pets.sort.updatedAt')}</option>
                <option value="createdAt">{t('pets.sort.createdAt')}</option>
                <option value="name">{t('pets.sort.name')}</option>
                <option value="animal">{t('pets.sort.animal')}</option>
                <option value="breed">{t('pets.sort.breed')}</option>
                <option value="birthday">{t('pets.sort.birthday')}</option>
                <option value="receivedDate">{t('pets.sort.receivedDate')}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">{t('pets.sortOrderLabel')}</span>
              <select
                value={sortOrder}
                onChange={(e) => onSortOrderChange(e.target.value as PetSearchBarProps['sortOrder'])}
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/15"
              >
                <option value="desc">{t('pets.sort.desc')}</option>
                <option value="asc">{t('pets.sort.asc')}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onSetViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-teal-50 text-teal-700' : 'bg-white text-slate-400 hover:text-slate-600'}
            title={t('pets.gridView')}
          >
            <LayoutGrid className="size-4.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onSetViewMode('list')}
            className={viewMode === 'list' ? 'bg-teal-50 text-teal-700' : 'bg-white text-slate-400 hover:text-slate-600'}
            title={t('pets.listView')}
          >
            <List className="size-4.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
