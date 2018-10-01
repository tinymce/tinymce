import WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import { setupDemo } from '../DemoHelpers';

import CodeMirror from '@ephox/wrap-codemirror';
import { Cell } from '@ephox/katamari';

const helpers = setupDemo();
const winMgr = WindowManager.setup(helpers.extras);

const source = `<p><img style="float: right;" src="images/glyph-tinymce@2x.png" alt="TinyMCE" height="150px" /></p>
  <h2>The world&rsquo;s first rich text editor in the cloud</h2>
  <p>Have you heard about Tiny Cloud? It&rsquo;s the first step in our journey to help you deliver great content creation experiences, no matter your level of expertise. 50,000 developers already agree. They get free access to our global CDN, image proxy services and auto updates to the TinyMCE editor. They&rsquo;re also ready for some exciting updates coming soon.</p>
  <p>One of these enhancements is <strong>Tiny Drive</strong>: imagine file management for TinyMCE, in the cloud, made super easy. Learn more at <a href="tinydrive/">tinymce.com/tinydrive</a>, where you&rsquo;ll find a working demo and an opportunity to provide feedback to the product team.</p>
  <h3>An editor for every project</h3>
  <p>Here are some of our customer&rsquo;s most common use cases for TinyMCE:</p>
  <ul>
  <li>Content Management Systems (<em>e.g. WordPress, Umbraco</em>)</li>
  <li>Learning Management Systems (<em>e.g. Blackboard</em>)</li>
  <li>Customer Relationship Management and marketing automation (<em>e.g. Marketo</em>)</li>
  <li>Email marketing (<em>e.g. Constant Contact</em>)</li>
  <li>Content creation in SaaS systems (<em>e.g. Eventbrite, Evernote, GoFundMe, Zendesk</em>)</li>
  </ul>
  <p>And those use cases are just the start. TinyMCE is incredibly flexible, and with hundreds of APIs there&rsquo;s likely a solution for your editor project. If you haven&rsquo;t experienced Tiny Cloud, get started today. You&rsquo;ll even get a free trial of our premium plugins &ndash; no credit card required!</p>`;

const makeHints = (codeMirror) => {
    // Code found in xmlcomplete demo
    // https://github.com/codemirror/CodeMirror/blob/master/demo/xmlcomplete.html
    const completeAfter = function (cm, pred) {
      if (!pred || pred()) {
        setTimeout(function () {
          if (!cm.state.completionActive) {
            cm.showHint({ completeSingle: false });
          }
        }, 100);
      }
      return codeMirror.Pass;
    };
    const completeIfAfterLt = function (cm) {
      return completeAfter(cm, function () {
        const cur = cm.getCursor();
        return cm.getRange(codeMirror.Pos(cur.line, cur.ch - 1), cur) === '<';
      });
    };

    const completeIfInTag = function (cm) {
      return completeAfter(cm, function () {
        const tok = cm.getTokenAt(cm.getCursor());
        if (tok.type === 'string' && (!/['"]/.test(tok.string.charAt(tok.string.length - 1)) || tok.string.length === 1)) {
          return false;
        }
        const inner = codeMirror.innerMode(cm.getMode(), tok.state).state;
        return inner.tagName;
      });
    };

    return {
      completeAfter,
      completeIfAfterLt,
      completeIfInTag
    };
  };

const codeMirrorInitialized = Cell(false);

export const CodeViewDemoSpec = {
  title: 'Code View',
  size: 'large',
  body: {
    type: 'panel',
    items: [
      {
        name: 'codeview',
        type: 'customeditor',
        init: (el) => new Promise((resolve) => {

          el.parentNode.classList.add('mce-codemirror');

          const hints = makeHints(CodeMirror);

          const cm = CodeMirror.fromTextArea(el, {
            lineWrapping: true,
            lineNumbers: true,
            foldGutter: true,
            matchTags: { bothTags: true },
            keyMap: 'sublime',
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
            extraKeys: {
              'Alt-F': 'findPersistent',
              'Ctrl-J': 'toMatchingTag',
              'Ctrl-B': 'selectNextOccurrence', // Atom
              '\'<\'': hints.completeAfter,
              '\'/\'': hints.completeIfAfterLt,
              '\' \'': hints.completeIfInTag,
              '\'=\'': hints.completeIfInTag,
              'Ctrl-Q' (cm) {
                cm.foldCode(cm.getCursor());
              }
            },
            mode: 'text/html',
            scrollbarStyle: 'native'
          });

          cm.setSize(450, 400);

          const api = {
            getValue: () => cm.doc.getValue() as string,
            setValue: (value) => {
                  cm.doc.setValue(value);
            },
                destroy: () => { cm.destroy(); }
              };

          // Needs a refresh after a while to render scrollbars
          setTimeout(function () {
            if (cm) {
              cm.refresh();
              cm.focus();
            }
            // just to simulate loading
            codeMirrorInitialized.set(true);
            resolve(api);
          }, 1000);
        })
      }
    ]
  },
  buttons: [
    {
      type: 'submit',
      name: 'ok',
      text: 'Ok',
      primary: true
    },
    {
      type: 'cancel',
      name: 'cancel',
      text: 'Cancel'
    }
  ],
  initialData: {
    codeview: source
  },
  onSubmit: () => { console.log('CodeView Demo Submit'); },
  onClose: () => { console.log('CodeView Demo Close'); },
  readyWhen: () => new Promise((resolve) => {
    // TODO: Investigate returning body in a promise as this is quite ugly...
    if (codeMirrorInitialized.get()) {
      resolve();
    } else {
      const intervalId = setInterval(() => {
        if (codeMirrorInitialized.get()) {
          clearInterval(intervalId);
          resolve();
        }
      }, 500);
    }
  })

};

export default () => {
  // The end user will use this as config
  winMgr.open(CodeViewDemoSpec, {}, () => {});
};
