import { Waiter } from '@ephox/agar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

export interface ErrorHelper {
  readonly pAssertErrorLogged: (label: string, message: string) => Promise<void>;
  readonly trackErrors: (editor: Editor, name: string) => void;
}

export default (): ErrorHelper => {
  const errors: string[] = [];

  const handleError = (e: { message: string }) => {
    errors.push(e.message);
  };

  const trackErrors = (editor: Editor, name: string) => {
    editor.on(name, handleError);
  };

  const pAssertErrorLogged = (label: string, message: string) => Waiter.pTryUntil(label, () => {
    assert.include(errors, message, label);
  }, 10, 1000);

  return {
    pAssertErrorLogged,
    trackErrors
  };
};
