import { useOutletContext } from 'react-router-dom';
import { LayoutContext } from '../../types';

export type { LayoutContext };

export function useLayoutContext() {
  return useOutletContext<LayoutContext>();
}
