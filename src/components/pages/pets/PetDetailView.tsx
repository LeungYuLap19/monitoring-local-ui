import React from 'react';
import { ArrowLeft, Edit3, ExternalLink, Heart, Info, Loader2, Tag, Video, VideoOff } from 'lucide-react';
import type { PetDetailViewProps } from '../../../types';
import { formatPetDate } from '../../../lib/utils/services/pet-service';
import { useTranslation } from '../../../lib/i18n';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-slate-50/70 p-4">
      <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</span>
      <div className="text-xs font-bold text-slate-700 break-words">{value}</div>
    </div>
  );
}

function getSexLabel(
  sex: 'male' | 'female' | null,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  if (sex === 'male') return t('pets.male');
  if (sex === 'female') return t('pets.female');
  return t('pets.notAvailable');
}

function getBooleanLabel(
  value: boolean | null,
  trueLabel: string,
  falseLabel: string,
  emptyLabel: string,
): string {
  if (value === null) return emptyLabel;
  return value ? trueLabel : falseLabel;
}

export default function PetDetailView({
  pet,
  activeDetailTab,
  onSetActiveDetailTab,
  onBack,
  onEdit,
  availableCameras = [],
  onUpdateMonitorCamera,
  isUpdatingCamera = false,
  monitorBackendConnected = false,
  onNavigateToMonitoring,
}: PetDetailViewProps) {
  const { t, locale } = useTranslation();
  const linkedCamera = availableCameras.find((camera) => camera.id === pet.monitorCameraId);
  const hasOnlineAssignableCamera = availableCameras.some((camera) => camera.isOnline);
  const showCameraSelector = monitorBackendConnected && (hasOnlineAssignableCamera || !linkedCamera);

  const displayBirthday = formatPetDate(pet.birthday, locale) || t('pets.notAvailable');
  const displayReceivedDate = formatPetDate(pet.receivedDate, locale) || t('pets.notAvailable');
  const displayCreatedAt = formatPetDate(pet.createdAt, locale) || t('pets.notAvailable');
  const displayUpdatedAt = formatPetDate(pet.updatedAt, locale) || t('pets.notAvailable');
  const displaySterilizationDate = formatPetDate(pet.sterilizationDate, locale) || t('pets.notAvailable');
  const displayMotherDob = formatPetDate(pet.motherDOB, locale) || t('pets.notAvailable');
  const displayFatherDob = formatPetDate(pet.fatherDOB, locale) || t('pets.notAvailable');

  return (
    <div id="pet-detail-view" className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-white p-4 py-4 shadow-sm sm:flex-row sm:items-center sm:px-6">
        <button
          onClick={onBack}
          className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-550 transition-colors hover:text-teal-600"
        >
          <ArrowLeft className="size-4 text-slate-400" />
          <span>{t('pets.backToList')}</span>
        </button>
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
              <Edit3 className="size-3.5" />
              {t('common.edit')}
            </Button>
          )}
          <Badge className="border-0 bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-700">
            {pet.status || t('pets.notAvailable')}
          </Badge>
        </div>
      </div>

      <div className="mb-4 flex flex-col items-start gap-4 sm:flex-row">
        <div className="size-12 overflow-hidden rounded-xl bg-teal-50 shadow-sm">
          {pet.primaryImageUrl ? (
            <img src={pet.primaryImageUrl} alt={pet.name} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center font-black text-lg uppercase text-teal-700">
              {pet.name.substring(0, 2)}
            </div>
          )}
        </div>
        <div>
          <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-800">
            {pet.name}
            <span className="text-lg">🐰</span>
          </h2>
          <p className="mt-0.5 text-xs font-bold text-slate-400">
            {pet.breed || t('pets.notAvailable')}
            {pet.animal ? ` · ${pet.animal}` : ''}
            {pet.sex ? ` · ${getSexLabel(pet.sex, t)}` : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="col-span-1 space-y-6 lg:col-span-4">
          <div className="overflow-hidden rounded-2xl bg-white shadow-md">
            <div className="relative aspect-square w-full bg-slate-100">
              {pet.primaryImageUrl ? (
                <img src={pet.primaryImageUrl} alt={pet.name} className="size-full object-cover" />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-3 bg-slate-950 p-6 font-mono text-slate-400">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-teal-950/40 text-teal-400">
                    <Heart className="size-8 fill-teal-500/20 text-teal-500" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-500">{pet.name}</span>
                  <span className="max-w-xs text-center text-[10px] font-mono uppercase leading-normal text-slate-500">
                    [ {t('pets.imagePlaceholder')} ]
                  </span>
                </div>
              )}
              <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-700 shadow-md">
                {pet.status || t('pets.notAvailable')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 p-6">
              <InfoRow label={t('pets.sexLabel')} value={getSexLabel(pet.sex, t)} />
              <InfoRow label={t('pets.ageLabel')} value={pet.ageYears !== null ? `${pet.ageYears} ${t('pets.ageUnit')}` : t('pets.notAvailable')} />
              <InfoRow label={t('pets.weightLabel')} value={pet.weight !== null ? `${pet.weight} kg` : t('pets.notAvailable')} />
              <InfoRow label={t('pets.receivedDateLabel')} value={displayReceivedDate} />
              <InfoRow label={t('pets.locationLabel')} value={pet.location || t('pets.notAvailable')} />
              <InfoRow label={t('pets.positionLabel')} value={pet.position || t('pets.notAvailable')} />
            </div>
          </div>
        </div>

        <div className="col-span-1 flex min-h-[480px] flex-col overflow-hidden rounded-2xl bg-white shadow-md lg:col-span-8">
          <div className="flex flex-wrap gap-2 border-b border-slate-100 bg-slate-50/20 px-6 py-2">
            <button
              onClick={() => onSetActiveDetailTab('info')}
              className={`cursor-pointer px-4 py-3 text-xs font-black transition-all ${
                activeDetailTab === 'info'
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'border-b-2 border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {t('pets.tabBasicInfo')}
            </button>
            <button
              onClick={() => onSetActiveDetailTab('photos')}
              className={`cursor-pointer px-4 py-3 text-xs font-black transition-all ${
                activeDetailTab === 'photos'
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'border-b-2 border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {t('pets.tabPhotos')} ({pet.imageUrls.length})
            </button>
            <button
              onClick={() => onSetActiveDetailTab('lineage')}
              className={`cursor-pointer px-4 py-3 text-xs font-black transition-all ${
                activeDetailTab === 'lineage'
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'border-b-2 border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {t('pets.tabLineage')}
            </button>
            {onUpdateMonitorCamera && (
              <button
                onClick={() => onSetActiveDetailTab('monitoring')}
                className={`cursor-pointer px-4 py-3 text-xs font-black transition-all ${
                  activeDetailTab === 'monitoring'
                    ? 'border-b-2 border-teal-600 text-teal-600'
                    : 'border-b-2 border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {t('pets.tabMonitoring')}
              </button>
            )}
          </div>

          <div className="flex-1 p-6 sm:p-8">
            {activeDetailTab === 'info' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{t('pets.infoLabel')}</h4>
                  <p className="rounded-2xl bg-slate-50 p-4 font-semibold leading-relaxed text-slate-600">
                    {pet.info || pet.features || t('pets.defaultNotes')}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoRow label={t('pets.animalLabel')} value={pet.animal || t('pets.notAvailable')} />
                  <InfoRow label={t('pets.breedLabel')} value={pet.breed || t('pets.notAvailable')} />
                  <InfoRow label={t('pets.birthdayLabel')} value={displayBirthday} />
                  <InfoRow label={t('pets.adoptionStatusLabel')} value={pet.adoptionStatus || t('pets.notAvailable')} />
                  <InfoRow
                    label={t('pets.sterilizationLabel')}
                    value={getBooleanLabel(
                      pet.sterilization,
                      t('pets.sterilized'),
                      t('pets.notSterilized'),
                      t('pets.notAvailable'),
                    )}
                  />
                  <InfoRow label={t('pets.sterilizationDateLabel')} value={displaySterilizationDate} />
                  <InfoRow label={t('pets.bloodTypeLabel')} value={pet.bloodType || t('pets.notAvailable')} />
                  <InfoRow label={t('pets.featuresLabel')} value={pet.features || t('pets.notAvailable')} />
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{t('pets.ownerSectionTitle')}</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InfoRow label={t('pets.ownerLabel')} value={pet.owner || t('pets.notAvailable')} />
                    <InfoRow label={t('pets.contact1Label')} value={pet.ownerContact1 || t('pets.notAvailable')} />
                    <InfoRow label={t('pets.contact2Label')} value={pet.ownerContact2 || t('pets.notAvailable')} />
                    <InfoRow label={t('pets.locationLabel')} value={pet.location || t('pets.notAvailable')} />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{t('pets.recordSectionTitle')}</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InfoRow label={t('pets.tagIdLabel')} value={pet.tagId || t('pets.notAvailable')} />
                    <InfoRow label={t('pets.ngoPetIdLabel')} value={pet.ngoPetId || t('pets.notAvailable')} />
                    <InfoRow
                      label={t('pets.registeredLabel')}
                      value={getBooleanLabel(
                        pet.isRegistered,
                        t('pets.registeredYes'),
                        t('pets.registeredNo'),
                        t('pets.notAvailable'),
                      )}
                    />
                    <InfoRow label={t('pets.latestPetLostIdLabel')} value={pet.latestPetLostId || t('pets.notAvailable')} />
                    <InfoRow label={t('pets.createdAtLabel')} value={displayCreatedAt} />
                    <InfoRow label={t('pets.updatedAtLabel')} value={displayUpdatedAt} />
                  </div>
                </div>
              </div>
            )}

            {activeDetailTab === 'photos' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                  <Info className="size-4 shrink-0 text-teal-600" />
                  <span>{t('pets.photoComplianceNote')}</span>
                </div>
                {pet.imageUrls.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                    {pet.imageUrls.map((imageUrl, index) => (
                      <div key={`${pet.id}-photo-${index}`} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                        <img
                          src={imageUrl}
                          alt={`${pet.name} ${index + 1}`}
                          className="aspect-square w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-slate-50 py-10 text-center text-xs font-semibold text-slate-400">
                    {t('pets.noPhotos')}
                  </div>
                )}
              </div>
            )}

            {activeDetailTab === 'lineage' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoRow label={t('pets.chipIdLabel')} value={pet.chipId || t('pets.notAvailable')} />
                  <InfoRow label={t('pets.placeOfBirthLabel')} value={pet.placeOfBirth || t('pets.notAvailable')} />
                  <InfoRow label={t('pets.transferCountLabel')} value={pet.transferCount} />
                  <InfoRow label={t('pets.transferNgoCountLabel')} value={pet.transferNgoCount} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Tag className="size-4 text-teal-600" />
                    <h5 className="text-xs font-black uppercase tracking-widest text-slate-400">{t('pets.motherSectionTitle')}</h5>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InfoRow label={t('pets.nameLabel')} value={pet.motherName || t('pets.notAvailable')} />
                    <InfoRow label={t('pets.breedLabel')} value={pet.motherBreed || t('pets.notAvailable')} />
                    <InfoRow label={t('pets.birthdayLabel')} value={displayMotherDob} />
                    <InfoRow label={t('pets.chipIdLabel')} value={pet.motherChip || t('pets.notAvailable')} />
                    <InfoRow label={t('pets.placeOfBirthLabel')} value={pet.motherPlaceOfBirth || t('pets.notAvailable')} />
                    <InfoRow label={t('pets.motherParityLabel')} value={pet.motherParity ?? t('pets.notAvailable')} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Tag className="size-4 text-teal-600" />
                    <h5 className="text-xs font-black uppercase tracking-widest text-slate-400">{t('pets.fatherSectionTitle')}</h5>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InfoRow label={t('pets.nameLabel')} value={pet.fatherName || t('pets.notAvailable')} />
                    <InfoRow label={t('pets.breedLabel')} value={pet.fatherBreed || t('pets.notAvailable')} />
                    <InfoRow label={t('pets.birthdayLabel')} value={displayFatherDob} />
                    <InfoRow label={t('pets.chipIdLabel')} value={pet.fatherChip || t('pets.notAvailable')} />
                    <InfoRow label={t('pets.placeOfBirthLabel')} value={pet.fatherPlaceOfBirth || t('pets.notAvailable')} />
                  </div>
                </div>
              </div>
            )}
            {activeDetailTab === 'monitoring' && onUpdateMonitorCamera && (
              <div className="space-y-6">
                {!pet.monitorCameraId ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center space-y-3">
                    <VideoOff className="size-9 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-500">{t('pets.monitorCameraNoLink')}</p>
                    <p className="text-xs text-slate-400">{t('pets.monitorCameraNoLinkHint')}</p>
                  </div>
                ) : (
                  <div
                    className={`rounded-2xl p-5 space-y-4 ${
                      linkedCamera?.isOnline
                        ? 'border border-teal-100 bg-teal-50/40'
                        : 'border border-rose-100 bg-rose-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`size-2.5 rounded-full ${
                            linkedCamera?.isOnline ? 'bg-teal-500 animate-pulse' : 'bg-rose-400'
                          }`}
                        />
                        <div className="space-y-1">
                          <span className={`block text-sm font-bold ${linkedCamera?.isOnline ? 'text-teal-700' : 'text-rose-700'}`}>
                            {linkedCamera?.name || `Camera ${pet.monitorCameraId}`}
                          </span>
                          <span className="block text-[11px] font-semibold text-slate-500">
                            {linkedCamera?.isOnline ? t('pets.monitorCameraGoLive') : t('pets.monitorCameraDisconnected')}
                          </span>
                        </div>
                      </div>
                      {onNavigateToMonitoring && monitorBackendConnected && linkedCamera?.isOnline ? (
                        <Button variant="outline" size="sm" onClick={onNavigateToMonitoring} className="gap-1.5">
                          <ExternalLink className="size-3.5" />
                          {t('pets.monitorCameraGoLive')}
                        </Button>
                      ) : null}
                    </div>
                    {!monitorBackendConnected ? (
                      <div className="flex items-start gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs text-slate-500">
                        <Video className="mt-0.5 size-4 shrink-0 text-rose-400" />
                        <span>{t('pets.monitorCameraDisconnectedHint')}</span>
                      </div>
                    ) : null}
                  </div>
                )}

                {showCameraSelector ? (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{t('pets.monitorCameraSelectLabel')}</h4>
                    <div className="flex items-center gap-3">
                      <select
                        value={pet.monitorCameraId ?? ''}
                        onChange={(e) => onUpdateMonitorCamera(e.target.value || null)}
                        disabled={isUpdatingCamera}
                        className="flex-1 rounded-xl bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none disabled:opacity-50"
                      >
                        <option value="">{t('pets.monitorCameraNone')}</option>
                        {availableCameras
                          .filter((camera) => camera.isOnline || camera.id === pet.monitorCameraId)
                          .map((cam) => (
                            <option key={cam.id} value={cam.id}>{cam.name}</option>
                          ))}
                      </select>
                      {isUpdatingCamera && <Loader2 className="size-4 animate-spin text-teal-600" />}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
