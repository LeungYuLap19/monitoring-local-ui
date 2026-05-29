import { useState } from 'react';
import { Cat, Rabbit, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../ui/dialog';

interface ModelSelectorModalProps {
  currentModelKeys: string[];
  aiModelSelectionLimit: number;
  petAnimal?: string | null;
  onSave: (selectedKeys: string[]) => Promise<void>;
  onClose: () => void;
}

const AVAILABLE_MODELS = [
  {
    key: 'dog_cat',
    label: 'Cat & Dog',
    description: 'Detects eating, drinking, and activity with bowl interaction tracking.',
    icon: Cat,
    animals: ['dog', 'cat'],
  },
  {
    key: 'rabbit',
    label: 'Rabbit',
    description: 'Detects eating, drinking, moving, and resting behaviors.',
    icon: Rabbit,
    animals: ['rabbit'],
  },
] as const;

const SUPPORTED_ANIMALS = ['dog', 'cat', 'rabbit'];

function getModelKeyForAnimal(animal: string): string | null {
  const normalized = animal.trim().toLowerCase();
  const model = AVAILABLE_MODELS.find((m) => m.animals.includes(normalized as never));
  return model?.key ?? null;
}

function getPetAnimalHint(petAnimal?: string | null): string | null {
  if (!petAnimal || !petAnimal.trim()) {
    return 'Your current pet animal type is not defined. Please select a model manually.';
  }
  const normalized = petAnimal.trim().toLowerCase();
  if (!SUPPORTED_ANIMALS.includes(normalized)) {
    return `Your current pet (${petAnimal}) is not supported by our behavior models. Please select the closest match.`;
  }
  return null;
}

export default function ModelSelectorModal({
  currentModelKeys,
  aiModelSelectionLimit,
  petAnimal,
  onSave,
  onClose,
}: ModelSelectorModalProps) {
  const suggestedKey = petAnimal ? getModelKeyForAnimal(petAnimal) : null;
  const initialKeys = currentModelKeys.length > 0
    ? currentModelKeys
    : suggestedKey ? [suggestedKey] : [];
  const [selected, setSelected] = useState<string[]>(initialKeys);
  const [saving, setSaving] = useState(false);
  const hint = currentModelKeys.length > 0 ? null : getPetAnimalHint(petAnimal);

  const toggleModel = (key: string) => {
    setSelected((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      }
      if (aiModelSelectionLimit === 1) {
        return [key];
      }
      if (prev.length >= aiModelSelectionLimit) {
        return prev;
      }
      return [...prev, key];
    });
  };

  const handleSave = async () => {
    if (!selected.length) return;
    setSaving(true);
    try {
      await onSave(selected);
      onClose();
    } catch {
      setSaving(false);
    }
  };

  const hasChanged =
    selected.length !== currentModelKeys.length ||
    selected.some((k) => !currentModelKeys.includes(k));

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-base font-black text-slate-800">AI Model</DialogTitle>
          <DialogDescription className="text-xs text-slate-400 mt-0.5">
            Select which AI behavior model to use for monitoring.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {hint && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <AlertCircle className="size-4 mt-0.5 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-800">{hint}</p>
            </div>
          )}

          <div className="space-y-3">
            {AVAILABLE_MODELS.map((model) => {
              const isSelected = selected.includes(model.key);
              const isSuggested = model.key === suggestedKey;
              const Icon = model.icon;
              return (
                <button
                  key={model.key}
                  type="button"
                  onClick={() => toggleModel(model.key)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-colors text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <Icon className={`size-5 mt-0.5 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                        {model.label}
                      </p>
                      {isSuggested && !isSelected && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{model.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !selected.length || !hasChanged}
            >
              {saving ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}