import { BROWSER_DEFAULT, languages } from './constants';

// Depending on the current location of the cursor, replace the current node with the HTML in `lang`
// This cannot be an arrow function because tinyMCE accesses it via a new keyword.
tinymce.PluginManager.add('language', function(editor) {
  const replaceText = (lang) => {
    const selectedNode = editor.selection.getNode();
    const newText = editor.selection.getContent({ format: 'html' });
    const contents = newText || '&#65279'; // use zero-width character as placeholder if no existing text
    const newSpanText = lang === BROWSER_DEFAULT ? `<span id="new_span">${contents}</span>` : `<span lang="${lang}" id="new_span">${contents}</span>`;
    editor.selection.setContent(''); // delete any existing text
    // may be in the middle of the span, so split it into two
    if (selectedNode.nodeName === 'SPAN') {
      if (selectedNode.lang) {
        editor.execCommand('mceInsertRawHTML', false, `</span>${newSpanText}<span lang="${selectedNode.lang}">`);
      } else {
        editor.execCommand('mceInsertRawHTML', false, `</span>${newSpanText}<span>`);
      }
    } else { // could be inside another tag like <a> or <b> that is a descendant of a span
      const parentSpan = tinymce.DOM.getParent(selectedNode, n => n.nodeName === 'SPAN' && !n.dataset.mceBogus);
      if (parentSpan) {
        let currentNode = selectedNode;
        let insertedText = newSpanText;
        while (currentNode !== parentSpan) { // wrap new span with same tags
          insertedText = `<${currentNode.nodeName.toLowerCase()}>${insertedText}</${currentNode.nodeName.toLowerCase()}>`;
          currentNode = currentNode.parentNode;
        }
        // create new span with or without lang attribute, depending on parent span
        if (parentSpan.lang) {
          insertedText = `</span>${insertedText}<span lang="${parentSpan.lang}">`;
        } else {
          insertedText = `</span>${insertedText}<span>`
        }
        currentNode = selectedNode
        while (currentNode !== parentSpan) { // close out old tags and create new ones at the end of inserted content
          insertedText = `</${currentNode.nodeName.toLowerCase()}>${insertedText}<${currentNode.nodeName.toLowerCase()}>`;
          currentNode = currentNode.parentNode;
        }
        editor.execCommand('mceInsertRawHTML', false, insertedText);
      } else { // conservatively insert HTML
        editor.execCommand('mceInsertRawHTML', false, newSpanText);
      }
    }
    const newSpan = editor.dom.get('new_span');
    editor.selection.select(newSpan);
    editor.selection.collapse(false); // moves cursor to end of selection
    newSpan.removeAttribute('id');
  };

  const updateButtonText = (lang) => {
    const button = editor.dom.select(`button#lang-button-${editor.id}`, editor.targetElm.nextElementSibling)[0];
    if (!lang || lang === BROWSER_DEFAULT) {
      button.innerText = 'Browser default language';
    } else {
      button.innerText = languages[lang].nativeName;
    }
  };

  // Get the language of the current cursor position
  const getSelectedLanguage = (editor) => {
    const selectedNode = editor.selection.getNode();
    let selectedLang;
    // TinyMCE inserts bogus span that have no meaning for language
    if (selectedNode.nodeName === 'SPAN' && !selectedNode.dataset.mceBogus) {
      selectedLang = selectedNode.lang;
    } else if (selectedNode.nodeName === 'P') { // we never add a lang attribute to a p tag
      selectedLang = null;
    } else { // might be inside another tag such as <b> or <a>
      const parentSpan = tinymce.DOM.getParent(selectedNode, n => n.nodeName === 'SPAN' && !n.dataset.mceBogus);
      if (parentSpan) {
        selectedLang = parentSpan.lang;
      } else {
        selectedLang = null;
      }
    }
    return selectedLang;
  }

  const openDialog = (buttonApi) => {
    const selectedNode = editor.selection.getNode();
    if (['OL', 'UL'].includes(selectedNode.nodeName)) {
      editor.notificationManager.open({
        text: 'You cannot change the language of a list. Set the language first and then create the list.',
        type: 'error',
      });
      return;
    }
    const selectedLang = getSelectedLanguage(editor);
    const currentLang = selectedLang ? selectedLang : BROWSER_DEFAULT;
    editor.windowManager.open({
      title: 'Language plugin',
      body: {
        type: 'panel',
        items: [
          {
            type: 'htmlpanel',
            html: `<div>Current language: ${languages[currentLang].nativeName}</div>`,
          },
          {
            type: 'selectbox',
            name: 'language',
            label: 'Language',
            items: Object.keys(languages).map(lang => ({
              value: lang,
              text: languages[lang].nativeName,
            })),
          },
        ],
      },
      buttons: [
        {
          type: 'cancel',
          text: 'Close',
        },
        {
          type: 'submit',
          text: 'Save',
          primary: true,
        },
      ],
      onSubmit(api) {
        const data = api.getData();
        editor.focus();
        editor.undoManager.transact(() => {
          replaceText(data.language);
          buttonApi.setActive(data.language !== BROWSER_DEFAULT);
          updateButtonText(data.language);
        });
        api.close();
      },
    });
  };

  editor.ui.registry.addToggleButton('language', {
    text: 'Browser default language',
    onAction(buttonApi) {
      openDialog(buttonApi);
    },
    onSetup(buttonApi) {
      // add an id attribute to the button so its text can be modified later
      // might be able to improve if https://github.com/tinymce/tinymce/issues/5040 gets resolved
      editor.dom.select('button', editor.targetElm.nextElementSibling).filter(b => b.innerText === 'Browser' +
          ' default language')[0].setAttribute('id', `lang-button-${editor.id}`);
      // Update button state (disabled: default, enabled: other) and button text
      const updateCurrentLanguage = () => {
        const selectedLang = getSelectedLanguage(editor);
        if (selectedLang) {
          buttonApi.setActive(true);
        } else {
          buttonApi.setActive(false);
        }
        updateButtonText(selectedLang);
      };
      editor.addShortcut('Meta+L', 'Switch to default language', () => {
        const selectedNode = editor.selection.getNode();
        const currentLang = selectedNode.lang ? selectedNode.lang : BROWSER_DEFAULT;
        if (currentLang !== BROWSER_DEFAULT) {
          editor.undoManager.transact(() => {
            replaceText(BROWSER_DEFAULT);
            buttonApi.setActive(false);
            updateCurrentLanguage();
          });
        }
      });
      editor.on('keyup', updateCurrentLanguage);
      editor.on('click', updateCurrentLanguage);
      return () => { // remove event listeners on teardown
        editor.off('keyup', updateCurrentLanguage);
        editor.off('click', updateCurrentLanguage);
      };
    },
  });

  return {
    getMetadata() {
      return {
        name: 'Language plugin',
      };
    },
  };
});
