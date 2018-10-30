import { AlloySystemApi } from './SystemApi';
import * as AlloyLogger from '../../log/AlloyLogger';
import { Fun } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';

const NoContextApi = (getComp?: () => AlloyComponent): AlloySystemApi => {
  const fail = (event) => {
    return () => {
      throw new Error('The component must be in a context to send: ' + event + '\n' +
        AlloyLogger.element(getComp().element()) + ' is not in context.'
      );
    };
  };

  return {
    debugInfo: Fun.constant('fake'),
    triggerEvent: fail('triggerEvent'),
    triggerFocus: fail('triggerFocus'),
    triggerEscape: fail('triggerEscape'),
    build: fail('build'),
    addToWorld: fail('addToWorld'),
    removeFromWorld: fail('removeFromWorld'),
    addToGui: fail('addToGui'),
    removeFromGui: fail('removeFromGui'),
    getByUid: fail('getByUid'),
    getByDom: fail('getByDom'),
    broadcast: fail('broadcast'),
    broadcastOn: fail('broadcastOn'),
    broadcastEvent: fail('broadcastEvent'),
    isConnected: Fun.constant(false)
  };
};

const singleton = NoContextApi();

export {
  singleton,
  NoContextApi
};
