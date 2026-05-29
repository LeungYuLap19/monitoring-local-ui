import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PetPaginationProps } from '../../../types';
import { useTranslation } from '../../../lib/i18n';
import { Button } from '../../ui/button';

function buildVisiblePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
}

export default function PetPagination({
  pagination,
  isLoading = false,
  onPreviousPage,
  onNextPage,
  onPageSelect,
}: PetPaginationProps) {
  const { t } = useTranslation();

  const visiblePages = useMemo(() => {
    if (!pagination) return [];
    return buildVisiblePages(pagination.page, pagination.totalPages);
  }, [pagination]);

  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs font-semibold text-slate-500">
        {t('pets.pagination.summary', {
          page: pagination.page,
          totalPages: pagination.totalPages,
          total: pagination.total,
        })}
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={isLoading || pagination.page <= 1}
          onClick={onPreviousPage}
          title={t('pets.pagination.previous')}
        >
          <ChevronLeft className="size-4" />
        </Button>

        {visiblePages.map((page, index) => {
          const previousPage = visiblePages[index - 1];
          const shouldShowGap = previousPage && page - previousPage > 1;

          return (
            <React.Fragment key={page}>
              {shouldShowGap ? (
                <span className="px-1 text-xs font-bold text-slate-300">...</span>
              ) : null}
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => onPageSelect(page)}
                className={pagination.page === page ? 'bg-teal-50 text-teal-700 border-teal-200' : undefined}
              >
                {page}
              </Button>
            </React.Fragment>
          );
        })}

        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={isLoading || pagination.page >= pagination.totalPages}
          onClick={onNextPage}
          title={t('pets.pagination.next')}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
