import { NavigateFunction } from 'react-router-dom';
import { PetGuest } from '../constants/domain';

export * from './auth';
export * from './monitoring';
export * from './pet';

export interface LayoutContext {
  selectedPetId: string;
  setSelectedPetId: (id: string) => void;
  petsList: PetGuest[];
  setPetsList: (pets: PetGuest[]) => void;
  onSelectCamera: (camId: string) => void;
  onSelectPet: (petId: string) => void;
  onOpenClipsModal: () => void;
  onGenerateLog: () => void;
  onOpenXiaomiLogin: () => void;
  onXiaomiLogout: () => void;
  xiaomiConnected: boolean;
  showToast: (message: string) => void;
  navigate: NavigateFunction;
}
