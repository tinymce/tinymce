import { Result } from '@ephox/katamari';
import { AlloyComponent } from './ComponentApi';

export type LazySink = (comp: AlloyComponent) => Result<AlloyComponent, any>;
