import { Fun } from '@ephox/katamari';

import * as AlloyLogger from '../../log/AlloyLogger';
import { AlloyComponent } from '../component/ComponentApi';
import { AlloySystemApi } from './SystemApi';

const NoContextApi = (getComp?: () => AlloyComponent): AlloySystemApi => {
  const getMessage = (event: string) => `The component must be in a context to execute: ${event}` +
    (getComp ? '\n' + AlloyLogger.element(getComp().element) + ' is not in context.' : '');

  const fail = (event: string) => (): never => {
    throw new Error(getMessage(event));
  };

  const warn = (event: string) => (): void => {
    // eslint-disable-next-line no-console
    console.warn(getMessage(event));
  };

  return {
    debugInfo: Fun.constant('fake'),
    triggerEvent: warn('triggerEvent'),
    triggerFocus: warn('triggerFocus'),
    triggerEscape: warn('triggerEscape'),
    broadcast: warn('broadcast'),
    broadcastOn: warn('broadcastOn'),
    broadcastEvent: warn('broadcastEvent'),
    build: fail('build'),
    buildOrPatch: fail('buildOrPatch'),
    addToWorld: fail('addToWorld'),
    removeFromWorld: fail('removeFromWorld'),
    addToGui: fail('addToGui'),
    removeFromGui: fail('removeFromGui'),
    getByUid: fail('getByUid'),
    getByDom: fail('getByDom'),
    isConnected: Fun.never
  };
};

const singleton = NoContextApi();

export {
  singleton,
  NoContextApi
};
