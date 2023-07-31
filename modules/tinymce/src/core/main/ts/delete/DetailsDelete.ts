import { Optional } from '@ephox/katamari';

import Editor from '../api/Editor';

const backspaceDelete = (editor: Editor, forward: boolean, granularity: 'character' | 'word' | 'line' | 'selection'): Optional<() => void> => {
  return Optional.some(() => [ editor, forward, granularity ]);
};

export {
  backspaceDelete
};
