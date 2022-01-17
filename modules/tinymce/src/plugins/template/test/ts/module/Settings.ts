import { Obj } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

const Settings = (hook: TinyHooks.Hook<Editor>) => {
  let settings = new Set<string>();

  const addSettings = (config: Record<string, any>) => {
    const editor = hook.editor();
    Obj.each(config, (val, key) => {
      editor.options.set(key, val);
      settings.add(key);
    });
  };

  const cleanupSettings = () => {
    const editor = hook.editor();
    settings.forEach((key) => editor.options.unset(key));
    settings = new Set<string>();
  };

  return { addSettings, cleanupSettings };
};

export { Settings };
