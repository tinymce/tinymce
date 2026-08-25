import { type RefObject, useMemo } from 'react';

import type { ConfirmOptions, ConfirmationHostHandle } from './ConfirmationHost';

export interface ConfirmationApi {
  readonly confirm: (options: ConfirmOptions) => void;
}

export const useConfirmationApi = (ref: RefObject<ConfirmationHostHandle>): ConfirmationApi =>
  useMemo(() => ({
    confirm: (options) => ref.current?.confirm(options),
  }), [ ref ]);
