import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as KeyboardNavTabI18n from './KeyboardNavTabI18n';

const pTab = async (pluginUrl: string): Promise<Dialog.TabSpec & { name: string }> => {
  const body: Dialog.BodyComponentSpec = {
    type: 'htmlpanel',
    presets: 'document',
    html: await KeyboardNavTabI18n.pLoadI18nHtml(pluginUrl)
  };

  return {
    name: 'keyboardnav',
    title: 'Keyboard Navigation',
    items: [ body ]
  };
};

export {
  pTab
};
