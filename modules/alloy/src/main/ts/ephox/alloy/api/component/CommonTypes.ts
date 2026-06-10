import type { Result } from '@ephox/katamari';

import type { AlloyComponent } from './ComponentApi';

export type LazySink = (comp: AlloyComponent) => Result<AlloyComponent, any>;
