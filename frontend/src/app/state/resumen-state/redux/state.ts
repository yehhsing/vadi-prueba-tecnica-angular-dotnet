import { Resumen } from '../../../core/models/api.models';

export interface ResumenState {
  data: Resumen | null;
  loading: boolean;
  error: string | null;
}

export const initialResumenState: ResumenState = {
  data: null,
  loading: false,
  error: null
};
