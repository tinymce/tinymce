import { Obj } from '@ephox/katamari';

const Settings = (hook) => {
  let settings = new Set<string>();

  const addSettings = (config: Record<string, any>) => {
    const editor = hook.editor();
    Obj.each(config, (val, key) => {
      editor.settings[key] = val;
      settings.add(key);
    });
  };

  const delSettings = () => {
    const editor = hook.editor();
    settings.forEach((key) => delete editor.settings[key]);
    settings = new Set<string>();
  };

  return { addSettings, delSettings };
};

export { Settings };
