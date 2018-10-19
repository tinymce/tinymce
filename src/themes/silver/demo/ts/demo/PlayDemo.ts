// import ButtonSetupDemo from './ButtonSetupDemo';
declare let tinymce: any;

import { LumberTimers } from '@ephox/alloy/lib/main/ts/ephox/alloy/alien/LumberTimers';
import { Arr } from '@ephox/katamari';

export default function () {
  tinymce.init({
    // TODO: Investigate. Should thisget the styles (e.g. margin) of the div/textarea?
    selector: 'div.tiny-text',
    inline: false,
    theme: 'silver',
    toolbar: [ 'styleselect', 'MagicButton', 'code', 'undo', 'toc', 'redo', 'preview', '|', 'help', 'link', '|', 'align', 'alignleft', 'alignright', 'aligncenter',
      'alignjustify', 'alignnone', '|', 'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', '|', 'blockquote',
      'outdent', 'indent', '|', 'cut', 'copy', 'paste', '|', 'help', 'selectall', 'visualaid', 'newdocument', 'removeformat', 'remove'
    ].join(' '),
    // content_css: ['//fonts.googleapis.com/css?family=Lato:300,300i,400,400i', 'https://staging.tiny.cloud/css/content-standard.min.css'],
    plugins: [
      'lists', // Required for list functionality (commands),
      'autolink', // Required for turning pasted text into hyperlinks
      'autosave', // Required to prevent users losing content when they press back
      'preview',
      'help',
      'searchreplace',
      'link',
      'wordcount',
      'table',
      'code',
      'toc',
      'paste',
      'image',
      'charmap',
      'emoticons',
      'imagetools',
      'textcolor',
      'media'
    ],
    // statusbar: false,
    resize: 'both',
    link_context_toolbar: true,
    // fixed_toolbar_container: '#tiny-fixed-container', // DEPRECATED

    menubar: 'file edit view insert format table tools Menu-1 help',
    menu: {
      'Menu-1': { title: 'Menu-1', items: 'menu-item-1 | link unlink | visualaid' }
    },

    // media_dimensions: false,

    style_formats: [
      {title: 'Bold text', inline: 'b'},
      {title: 'Red text', inline: 'span', styles: {color: '#ff0000'}},
      {title: 'Red header', block: 'h1', styles: {color: '#ff0000'}},
      {title: 'Example 1', inline: 'span', classes: 'example1'},
      {title: 'Example 2', inline: 'span', classes: 'example2'},
      {title: 'Table styles'},
      {title: 'Table row 1', selector: 'tr', classes: 'tablerow1'},
      {
        title: 'Headings', items: [
          { title: 'Heading 1', format: 'h1' },
          { title: 'Heading 2', format: 'h2' },
          { title: 'Heading 3', format: 'h3' },
          { title: 'Heading 4', format: 'h4' },
          { title: 'Heading 5', format: 'h5' },
          { title: 'Heading 6', format: 'h6' }
        ]
      },

      {
        title: 'Inline', items: [
          { title: 'Bold', icon: 'bold', format: 'bold' },
          // { title: 'Italic', icon: 'italic', format: 'italic' },
          // { title: 'Underline', icon: 'underline', format: 'underline' },
          // { title: 'Strikethrough', icon: 'strikethrough', format: 'strikethrough' },
          // { title: 'Superscript', icon: 'superscript', format: 'superscript' },
          // { title: 'Subscript', icon: 'subscript', format: 'subscript' },
          // { title: 'Code', icon: 'code', format: 'code' }
        ]
      },

      {
        title: 'Blocks', items: [
          // { title: 'Paragraph', format: 'p' },
          // { title: 'Blockquote', format: 'blockquote' },
          // { title: 'Div', format: 'div' },
          // { title: 'Pre', format: 'pre' }
        ]
      },

      // {
      //   title: 'Alignment', items: [
      //     { title: 'Left', icon: 'alignleft', format: 'alignleft' },
      //     { title: 'Center', icon: 'aligncenter', format: 'aligncenter' },
      //     { title: 'Right', icon: 'alignright', format: 'alignright' },
      //     { title: 'Justify', icon: 'alignjustify', format: 'alignjustify' }
      //   ]
      // }
    ],

    setup (ed) {
      // ButtonSetupDemo.setup(ed);

      ed.on('skinLoaded', function () {
        // Notification fields for equality: type, text, progressBar, timeout
        ed.notificationManager.open({
          text: 'You will not see this because the mobile theme has no notifications',
          type: 'info'
        });
      });

      ed.ui.registry.addButton('MagicButton', {
        text: 'yeah button text',
        onAction: () => {
          console.log('clucked');
        }
      });

      ed.ui.registry.addMenuItem('menu-item-1', {
        text: 'My menu item',
        onAction: () => {
          ed.insertContent('Hello world!!');
        }
      });

      ed.addSidebar('example', {
        tooltip: 'My sidebar',
        icon: 'my-side-bar',
        image: 'http://www.google.com/google.jpg',
        onshow: (api) => {
          console.log(api.element());
        },
        onhide: (api) => {
          console.log(api.element());
        },
        onrender: (api) => {
          console.log(api.element());
        }
      });
      ed.ui.registry.addContextToolbar('custom', {
        type: 'contexttoolbar',
        predicate: (node) => node.nodeName.toLowerCase() === 'h1',
        items: [ 'help', 'link', 'preview' ],
        scope: 'node',
        position: 'selection'
      });

    }
  });

  Arr.each([
    'info',
    'bBlob',
    // 'bBlob.schema',
    // 'bBlob.data',
    // 'bBlob.validated',
    'modDefinition',
    'renderToDom',
    'events'
  ], LumberTimers.register);
}

// const systemApi = LumberTimers.run('nocontext', () => {
//   return Cell(singleton);
// });

// const info: CustomDefinition.CustomDetail = LumberTimers.run('info', () => {
//     return ValueSchema.getOrDie(CustomDefinition.toInfo(spec))
//   }
// );

// // FIX: this comment is outdated.

// // The behaviour configuration is put into info.behaviours(). For everything else,
// // we just need the list of static behaviours that this component cares about. The behaviour info
// // to pass through will come from the info.behaviours() obj.
// const bBlob = LumberTimers.run('bBlob', () => CompBehaviours.generate(spec));

// const bList = LumberTimers.run('bList', () => BehaviourBlob.getBehaviours(bBlob));
// const bData = LumberTimers.run('bData', () => BehaviourBlob.getData(bBlob));

// const modDefinition = LumberTimers.run('modDefinition', () => {
//   return getDomDefinition(info, bList, bData);
// });
// // const modDefinition = '';
// const item = LumberTimers.run('renderToDom', () => DomRender.renderToDom(modDefinition));
// const events = LumberTimers.run('events', () => getEvents(info, bList, bData));

// const subcomponents = LumberTimers.run('subcomponents', () => Cell(info.components));