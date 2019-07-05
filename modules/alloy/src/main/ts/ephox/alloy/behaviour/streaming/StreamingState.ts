import { Cell } from '@ephox/katamari';

import { StreamingConfig, StreamingState, CancellableStreamer } from './StreamingTypes';
import { nuState } from '../common/BehaviourState';

const throttle = (_config: StreamingConfig): StreamingState => {
  const state = Cell<CancellableStreamer>(null);

  const readState = () => {
    return {
      timer: state.get() !== null ? 'set' : 'unset'
    };
  };

  const setTimer = (t: { cancel: () => void }) => {
    state.set(t);
  };

  const cancel = () => {
    const t = state.get();
    if (t !== null) {
      t.cancel();
    }
  };

  return nuState({
    readState,
    setTimer,
    cancel
  }) as StreamingState;
};

const init = (spec: StreamingConfig): StreamingState => {
  return spec.stream.streams.state(spec);
};

export {
  throttle,
  init
};
