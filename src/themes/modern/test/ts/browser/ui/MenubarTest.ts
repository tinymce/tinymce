import { Assertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr, Fun } from '@ephox/katamari';

import { Editor } from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import Menubar from 'tinymce/themes/modern/ui/Menubar';

UnitTest.test('browser.tinymce.themes.modern.test.ui.MenubarTest', function () {
  const menuItems = [
    'newdocument',
    'restoredraft',
    'preview',
    'print',
    'undo',
    'redo',
    'cut',
    'copy',
    'paste',
    'pastetext',
    'selectall',
    'code',
    'visualaid',
    'visualchars',
    'visualblocks',
    'spellchecker',
    'preview',
    'fullscreen',
    'image',
    'link',
    'media',
    'template',
    'codesample',
    'inserttable',
    'charmap',
    'hr',
    'pagebreak',
    'nonbreaking',
    'anchor',
    'toc',
    'insertdatetime',
    'bold',
    'italic',
    'underline',
    'strikethrough',
    'superscript',
    'subscript',
    'codeformat',
    'blockformats',
    'align',
    'removeformat',
    'spellcheckerlanguage',
    'a11ycheck'
  ];

  const testMenubarCustomItems = function (label, expectedStructure, settings, customItemsCallback) {
    const editor = new Editor('id', settings, EditorManager);

    Arr.each(menuItems, function (name) {
      editor.addMenuItem(name, { text: name });
    });

    customItemsCallback(editor);

    const menuButtons = Menubar.createMenuButtons(editor);
    Assertions.assertEq(label, expectedStructure, menuButtons);
  };

  const testMenubar = function (label, expectedStructure, settings) {
    testMenubarCustomItems(label, expectedStructure, settings, Fun.noop);
  };

  const menuItem = function (text) {
    return { text };
  };

  const menuSeparator = function () {
    return { text: '|' };
  };

  const menuCustomItem = function (item) {
    return item;
  };

  testMenubar(
    'Default config should match',
    [
      {
        text: 'File',
        menu: [
          menuItem('newdocument'),
          menuItem('restoredraft'),
          menuSeparator(),
          menuItem('preview'),
          menuSeparator(),
          menuItem('print')
        ]
      },

      {
        text: 'Edit',
        menu: [
          menuItem('undo'),
          menuItem('redo'),
          menuSeparator(),
          menuItem('cut'),
          menuItem('copy'),
          menuItem('paste'),
          menuItem('pastetext'),
          menuSeparator(),
          menuItem('selectall')
        ]
      },

      {
        text: 'View',
        menu: [
          menuItem('code'),
          menuSeparator(),
          menuItem('visualaid'),
          menuItem('visualchars'),
          menuItem('visualblocks'),
          menuSeparator(),
          menuItem('spellchecker'),
          menuSeparator(),
          menuItem('preview'),
          menuItem('fullscreen')
        ]
      },

      {
        text: 'Insert',
        menu: [
          menuItem('image'),
          menuItem('link'),
          menuItem('media'),
          menuItem('template'),
          menuItem('codesample'),
          menuItem('inserttable'),
          menuSeparator(),
          menuItem('charmap'),
          menuItem('hr'),
          menuSeparator(),
          menuItem('pagebreak'),
          menuItem('nonbreaking'),
          menuItem('anchor'),
          menuItem('toc'),
          menuSeparator(),
          menuItem('insertdatetime')
        ]
      },

      {
        text: 'Format',
        menu: [
          menuItem('bold'),
          menuItem('italic'),
          menuItem('underline'),
          menuItem('strikethrough'),
          menuItem('superscript'),
          menuItem('subscript'),
          menuItem('codeformat'),
          menuSeparator(),
          menuItem('blockformats'),
          menuItem('align'),
          menuSeparator(),
          menuItem('removeformat')
        ]
      },

      {
        text: 'Tools',
        menu: [
          menuItem('spellchecker'),
          menuItem('spellcheckerlanguage'),
          menuSeparator(),
          menuItem('a11ycheck'),
          menuItem('code')
        ]
      }
    ],
    {}
  );

  testMenubar(
    'Default config with some removed items',
    [
      {
        text: 'File',
        menu: [
          menuItem('newdocument'),
          menuItem('restoredraft'),
          menuSeparator(),
          menuItem('print')
        ]
      },

      {
        text: 'Edit',
        menu: [
          menuItem('undo'),
          menuItem('redo'),
          menuSeparator(),
          menuItem('cut'),
          menuItem('copy'),
          menuItem('paste'),
          menuItem('pastetext'),
          menuSeparator(),
          menuItem('selectall')
        ]
      },

      {
        text: 'View',
        menu: [
          menuItem('visualaid'),
          menuItem('visualchars'),
          menuItem('visualblocks'),
          menuSeparator(),
          menuItem('spellchecker'),
          menuSeparator(),
          menuItem('fullscreen')
        ]
      },

      {
        text: 'Insert',
        menu: [
          menuItem('image'),
          menuItem('link'),
          menuItem('media'),
          menuItem('template'),
          menuItem('codesample'),
          menuItem('inserttable'),
          menuSeparator(),
          menuItem('charmap'),
          menuItem('hr'),
          menuSeparator(),
          menuItem('pagebreak'),
          menuItem('nonbreaking'),
          menuItem('anchor'),
          menuItem('toc'),
          menuSeparator(),
          menuItem('insertdatetime')
        ]
      },

      {
        text: 'Format',
        menu: [
          menuItem('bold'),
          menuItem('italic'),
          menuItem('underline'),
          menuItem('strikethrough'),
          menuItem('superscript'),
          menuItem('subscript'),
          menuItem('codeformat'),
          menuSeparator(),
          menuItem('blockformats'),
          menuItem('align')
        ]
      },

      {
        text: 'Tools',
        menu: [
          menuItem('spellchecker'),
          menuItem('spellcheckerlanguage'),
          menuSeparator(),
          menuItem('a11ycheck')
        ]
      }
    ],
    {
      removed_menuitems: 'preview code removeformat'
    }
  );

  testMenubar(
    'Menubar config with only file menu button',
    [
      {
        text: 'File',
        menu: [
          menuItem('newdocument'),
          menuItem('restoredraft'),
          menuSeparator(),
          menuItem('preview'),
          menuSeparator(),
          menuItem('print')
        ]
      }
    ],
    {
      menubar: 'file'
    }
  );

  testMenubar(
    'Menu custom config',
    [
      {
        text: 'Custom file',
        menu: [
          menuItem('newdocument'),
          menuItem('preview')
        ]
      },
      {
        text: 'Custom view',
        menu: [
          menuItem('preview')
        ]
      }
    ],
    {
      menu: {
        file: { title: 'Custom file', items: 'newdocument preview' },
        view: { title: 'Custom view', items: 'preview' }
      }
    }
  );

  testMenubar(
    'Menu custom config cleanup separators',
    [
      {
        text: 'Custom file',
        menu: [
          menuItem('newdocument'),
          menuSeparator(),
          menuItem('preview')
        ]
      }
    ],
    {
      menu: {
        file: { title: 'Custom file', items: '| newdocument | | | preview |' }
      }
    }
  );

  testMenubarCustomItems(
    'Adding custom menu items by context',
    [
      {
        text: 'File',
        menu: [
          menuCustomItem({
            text: 'custom3',
            context: 'file',
            prependToContext: true
          }),
          menuItem('newdocument'),
          menuItem('restoredraft'),
          menuSeparator(),
          menuItem('preview'),
          menuSeparator(),
          menuItem('print'),
          menuCustomItem({
            text: 'custom1',
            context: 'file'
          }),
          menuCustomItem({
            text: 'custom2',
            context: 'file'
          })
        ]
      }
    ],
    {
      menubar: 'file'
    },
    function (editor) {
      editor.addMenuItem('custom1', {
        text: 'custom1',
        context: 'file'
      });

      editor.addMenuItem('custom2', {
        text: 'custom2',
        context: 'file'
      });

      editor.addMenuItem('custom3', {
        text: 'custom3',
        context: 'file',
        prependToContext: true
      });
    }
  );

  testMenubarCustomItems(
    'Adding custom menu items',
    [
      {
        text: 'File',
        menu: [
          menuCustomItem({
            text: 'custom1'
          })
        ]
      }
    ],
    {
      menu: {
        file: { title: 'File', items: 'custom1' }
      }
    },
    function (editor) {
      editor.addMenuItem('custom1', {
        text: 'custom1'
      });

      editor.addMenuItem('custom2', {
        text: 'custom2'
      });
    }
  );
});
