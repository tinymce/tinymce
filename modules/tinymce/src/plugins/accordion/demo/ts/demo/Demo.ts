import { SugarElement } from '@ephox/sugar';

import type { Editor, TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

const makeSidebar = (ed: Editor, name: string, icon: string, background: string, content: string) => {
  ed.ui.registry.addSidebar(name, {
    icon,
    tooltip: 'Tooltip for ' + name,
    onSetup: (api) => {
      const box = SugarElement.fromHtml(
        '<div style="width: 100%; box-sizing: border-box; padding: 12px; font: 14px/1.5 sans-serif; background: ' + background + ';">' + content + '</div>'
      );
      api.element().appendChild(box.dom);
      return () => {
        api.element().removeChild(box.dom);
      };
    },
    onShow: (_api) => {
      // eslint-disable-next-line no-console
      console.log('onShow ' + name);
    },
    onHide: (_api) => {
      // eslint-disable-next-line no-console
      console.log('onHide ' + name);
    }
  });
};

tinymce.init({
  selector: 'textarea.tinymce',
  license_key: 'gpl',
  plugins: 'table lists image accordion code',
  toolbar: 'table | numlist bullist | image | accordion | code | sidebar1 sidebar2',
  menu: { insert: { title: 'Insert', items: 'table | image | accordion' }},
  details_initial_state: 'inherited',
  details_serialize_state: 'inherited',
  setup: (ed) => {
    const commentsContent =
      '<h2 style="margin: 0 0 8px; font-size: 15px;">Comments</h2>'
      + '<ul style="margin: 0; padding-left: 18px;">'
      + '<li>Looks good to me 👍</li>'
      + '<li>Can we reword this heading?</li>'
      + '<li>Missing a closing tag here.</li>'
      + '</ul>';

    const bookmarksContent =
      '<h2 style="margin: 0 0 8px; font-size: 15px;">Bookmarks</h2>'
      + '<p style="margin: 0 0 12px;">Jump to a saved section:</p>'
      + '<a href="#" style="display: block; margin-bottom: 6px;">Introduction</a>'
      + '<a href="#" style="display: block; margin-bottom: 6px;">Getting started</a>'
      + '<a href="#" style="display: block;">API reference</a>';

    makeSidebar(ed, 'sidebar1', 'comment', '#e8f0e8', commentsContent);
    makeSidebar(ed, 'sidebar2', 'bookmark', '#f0e8e8', bookmarksContent);
  }
});

export {};
