import React from 'react';
import { Plus, Edit3, ImagePlus, X } from 'lucide-react';
import { PetFormModalProps } from '../../../types';
import { useTranslation } from '../../../lib/i18n';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog';

export default function PetFormModal({
  mode,
  formState,
  imageFiles,
  isSubmitting,
  onFieldChange,
  onImageFilesChange,
  onSubmit,
  onClose
}: PetFormModalProps) {
  const { t } = useTranslation();
  const isAdd = mode === 'add';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !onImageFilesChange) return;
    const current = imageFiles ?? [];
    onImageFilesChange([...current, ...Array.from(files)]);
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    if (!onImageFilesChange || !imageFiles) return;
    onImageFilesChange(imageFiles.filter((_, i) => i !== index));
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg p-0">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <DialogTitle className="text-base font-black text-slate-800 flex items-center gap-2">
            {isAdd ? <Plus className="size-5 text-teal-600" /> : <Edit3 className="size-5 text-teal-600" />}
            <span>{isAdd ? t('pets.form.addTitle') : t('pets.form.editTitle', { name: formState.formName })}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 mt-0.5">
            {isAdd ? t('pets.form.addDescription') : t('pets.form.editDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-500">{t('pets.form.nameLabel')}</Label>
              <Input
                type="text"
                required
                value={formState.formName}
                onChange={(e) => onFieldChange('formName', e.target.value)}
                placeholder={t('pets.form.namePlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-500">{t('pets.form.animalLabel')}</Label>
              {formState.formAnimal === 'other' || (formState.formAnimal && !['dog', 'cat', 'rabbit'].includes(formState.formAnimal.toLowerCase())) ? (
                <div className="flex gap-1.5">
                  <Input
                    type="text"
                    required
                    value={formState.formAnimal === 'other' ? '' : formState.formAnimal}
                    onChange={(e) => onFieldChange('formAnimal', e.target.value)}
                    placeholder={t('pets.form.animalOtherPlaceholder')}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-10 px-2 text-slate-400 hover:text-slate-600"
                    onClick={() => onFieldChange('formAnimal', 'dog')}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <select
                  required
                  value={formState.formAnimal.toLowerCase()}
                  onChange={(e) => onFieldChange('formAnimal', e.target.value === 'other' ? 'other' : e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="">{t('pets.form.animalPlaceholder')}</option>
                  <option value="dog">{t('pets.form.animalDog')}</option>
                  <option value="cat">{t('pets.form.animalCat')}</option>
                  <option value="rabbit">{t('pets.form.animalRabbit')}</option>
                  <option value="other">{t('pets.form.animalOther')}</option>
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-500">{t('pets.form.sexLabel')}</Label>
              <select
                value={formState.formSex}
                onChange={(e) => onFieldChange('formSex', e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="Male">{t('pets.form.sexMale')}</option>
                <option value="Female">{t('pets.form.sexFemale')}</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-500">{t('pets.form.birthdayLabel')}</Label>
              <Input
                type="date"
                required
                value={formState.formBirthday}
                onChange={(e) => onFieldChange('formBirthday', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-500">{t('pets.form.weightLabel')}</Label>
              <Input
                type="number"
                step="0.1"
                min={0}
                value={formState.formWeight || ''}
                onChange={(e) => onFieldChange('formWeight', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-500">{t('pets.form.breedLabel')}</Label>
              <Input
                type="text"
                value={formState.formBreed}
                onChange={(e) => onFieldChange('formBreed', e.target.value)}
                placeholder={t('pets.form.breedPlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-500">{t('pets.form.bloodTypeLabel')}</Label>
              <Input
                type="text"
                value={formState.formBloodType}
                onChange={(e) => onFieldChange('formBloodType', e.target.value)}
                placeholder={t('pets.form.bloodTypePlaceholder')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-500">{t('pets.form.sterilizationLabel')}</Label>
              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  id={`form-${mode}-sterilization`}
                  checked={formState.formSterilization}
                  onCheckedChange={(checked) => onFieldChange('formSterilization', !!checked)}
                />
                <Label htmlFor={`form-${mode}-sterilization`} className="text-xs font-bold text-slate-600 cursor-pointer">
                  {t('pets.form.sterilizationYes')}
                </Label>
              </div>
            </div>
            {formState.formSterilization && (
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-500">{t('pets.form.sterilizationDateLabel')}</Label>
                <Input
                  type="date"
                  value={formState.formSterilizationDate}
                  onChange={(e) => onFieldChange('formSterilizationDate', e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-500">{t('pets.form.adoptionStatusLabel')}</Label>
            <Input
              type="text"
              value={formState.formAdoptionStatus}
              onChange={(e) => onFieldChange('formAdoptionStatus', e.target.value)}
              placeholder={t('pets.form.adoptionStatusPlaceholder')}
            />
          </div>

          {onImageFilesChange && (
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500">{t('pets.form.imagesLabel')}</Label>
              <div className="flex flex-wrap gap-2">
                {imageFiles?.map((file, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="size-16 rounded-lg object-cover border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(i)}
                      className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                <label className="size-16 rounded-lg border-2 border-dashed border-slate-200 hover:border-teal-400 flex items-center justify-center cursor-pointer transition-colors">
                  <ImagePlus className="size-5 text-slate-400" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('common.saving') : isAdd ? t('pets.form.submitAdd') : t('pets.form.submitEdit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
