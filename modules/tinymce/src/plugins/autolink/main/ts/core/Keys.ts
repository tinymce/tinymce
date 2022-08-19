import { Fun, Obj, Strings, Type, Unicode } from '@ephox/katamari';

import TextSeeker from 'tinymce/core/api/dom/TextSeeker';
import Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';
import { findChar, freefallRtl, hasProtocol, isBracketOrSpace, isPunctuation } from './Utils';

interface ParseResult {
  readonly rng: Range;
  readonly url: string;
}

const parseCurrentLine = (editor: Editor, offset: number): ParseResult | null => {
  const voidElements = editor.schema.getVoidElements();
  const autoLinkPattern = Options.getAutoLinkPattern(editor);
  const { dom, selection } = editor;

  // Never create a link when we are inside a link
  if (dom.getParent(selection.getNode(), 'a[href]') !== null) {
    return null;
  }

  const rng = selection.getRng();
  const textSeeker = TextSeeker(dom, (node) => {
    return dom.isBlock(node) || Obj.has(voidElements, node.nodeName.toLowerCase()) || dom.getContentEditable(node) === 'false';
  });

  // Descend down the end container to find the text node
  const { container: endContainer, offset: endOffset } = freefallRtl(rng.endContainer, rng.endOffset);

  // Find the root container to use when walking
  const root = dom.getParent(endContainer, dom.isBlock) ?? dom.getRoot();

  // Move the selection backwards to the start of the potential URL to account for the pressed character
  // while also excluding the last full stop from a word like "www.site.com."
  const endSpot = textSeeker.backwards(endContainer, endOffset + offset, (node, offset) => {
    const text = node.data;
    const idx = findChar(text, offset, Fun.not(isBracketOrSpace));
    // Move forward one so the offset is after the found character unless the found char is a punctuation char
    return idx === -1 || isPunctuation(text[idx]) ? idx : idx + 1;
  }, root);

  if (!endSpot) {
    return null;
  }

  // Walk backwards until we find a boundary or a bracket/space
  let lastTextNode = endSpot.container;
  const startSpot = textSeeker.backwards(endSpot.container, endSpot.offset, (node, offset) => {
    lastTextNode = node;
    const idx = findChar(node.data, offset, isBracketOrSpace);
    // Move forward one so that the offset is after the bracket/space
    return idx === -1 ? idx : idx + 1;
  }, root);

  const newRng = dom.createRng();
  if (!startSpot) {
    newRng.setStart(lastTextNode, 0);
  } else {
    newRng.setStart(startSpot.container, startSpot.offset);
  }
  newRng.setEnd(endSpot.container, endSpot.offset);

  const rngText = Unicode.removeZwsp(newRng.toString());
  const matches = rngText.match(autoLinkPattern);
  if (matches) {
    let url = matches[0];
    if (Strings.startsWith(url, 'www.')) {
      const protocol = Options.getDefaultLinkProtocol(editor);
      url = protocol + '://' + url;
    } else if (Strings.contains(url, '@') && !hasProtocol(url)) {
      url = 'mailto:' + url;
    }

    return { rng: newRng, url };
  } else {
    return null;
  }
};

const convertToLink = (editor: Editor, result: ParseResult): void => {
  const { dom, selection } = editor;
  const { rng, url } = result;

  const bookmark = selection.getBookmark();
  selection.setRng(rng);

  // Needs to be a native createlink command since this is executed in a keypress event handler
  // so the pending character that is to be inserted needs to be inserted after the link. That will not
  // happen if we use the formatter create link version. Since we're using the native command
  // then we also need to ensure the exec command events are fired for backwards compatibility.
  const command = 'createlink';
  const args = { command, ui: false, value: url };
  const beforeExecEvent = editor.dispatch('BeforeExecCommand', args);
  if (!beforeExecEvent.isDefaultPrevented()) {
    editor.getDoc().execCommand(command, false, url);
    editor.dispatch('ExecCommand', args);

    const defaultLinkTarget = Options.getDefaultLinkTarget(editor);
    if (Type.isString(defaultLinkTarget)) {
      const anchor = selection.getNode();
      dom.setAttrib(anchor, 'target', defaultLinkTarget);

      // Ensure noopener is added for blank targets to prevent window opener attacks
      if (defaultLinkTarget === '_blank' && !Options.allowUnsafeLinkTarget(editor)) {
        dom.setAttrib(anchor, 'rel', 'noopener');
      }
    }
  }

  selection.moveToBookmark(bookmark);
  editor.nodeChanged();
};

const handleSpacebar = (editor: Editor): void => {
  const result = parseCurrentLine(editor, -1);
  if (Type.isNonNullable(result)) {
    convertToLink(editor, result);
  }
};

const handleBracket = handleSpacebar;

const handleEnter = (editor: Editor): void => {
  const result = parseCurrentLine(editor, 0);
  if (Type.isNonNullable(result)) {
    convertToLink(editor, result);
  }
};

const setup = (editor: Editor): void => {
  editor.on('keydown', (e) => {
    if (e.keyCode === 13 && !e.isDefaultPrevented()) {
      handleEnter(editor);
    }
  });

  editor.on('keyup', (e) => {
    if (e.keyCode === 32) {
      handleSpacebar(editor);
    // One of the closing bracket keys: ), ] or }
    } else if (e.keyCode === 48 && e.shiftKey || e.keyCode === 221) {
      handleBracket(editor);
    }
  });
};

export {
  setup
};
