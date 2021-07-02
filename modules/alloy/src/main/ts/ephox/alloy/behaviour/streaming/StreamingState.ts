import { Cell } from '@ephox/katamari';

import { nuState } from '../common/BehaviourState';
import { CancellableStreamer, StreamingConfig, StreamingState } from './StreamingTypes';

const throttle = (_config: StreamingConfig): StreamingState => {
  const state = Cell<CancellableStreamer | null>(null);

  const readState = () => ({
    timer: state.get() !== null ? 'set' : 'unset'
  });

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
  });
};

const init = (spec: StreamingConfig): StreamingState => spec.stream.streams.state(spec);

export {
  throttle,
  init
};
