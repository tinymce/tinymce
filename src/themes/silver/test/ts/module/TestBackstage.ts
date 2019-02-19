import TestProviders from './TestProviders';
import { Fun } from '@ephox/katamari';

export default {
  shared: {
    providers: TestProviders,
    interpreter: Fun.identity
  },
  interpreter: Fun.identity
}