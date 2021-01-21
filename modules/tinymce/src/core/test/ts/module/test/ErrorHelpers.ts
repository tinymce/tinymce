import { Step, Waiter } from '@ephox/agar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

export default () => {
  const errors: string[] = [];

  const handleError = (e: { message: string }) => {
    errors.push(e.message);
  };

  const trackErrors = (editor: Editor, name: string) => {
    editor.on(name, handleError);
  };

  const sAssertErrorLogged = (label: string, message: string) => Waiter.sTryUntil(label,
    Step.sync(() => {
      assert.include(errors, message, label);
    }),
    10, 1000
  );

  const pAssertErrorLogged = (label: string, message: string) => Waiter.pTryUntil(label, () => {
    assert.include(errors, message, label);
  }, 10, 1000);

  return {
    pAssertErrorLogged,
    sAssertErrorLogged,
    trackErrors
  };
};
