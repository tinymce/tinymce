import { Optional } from '@ephox/katamari';
import { Remove, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import BookmarkManager from '../api/dom/BookmarkManager';
import Editor from '../api/Editor';
import Schema from '../api/html/Schema';
import HtmlSerializer from '../api/html/Serializer';
import CaretPosition from '../caret/CaretPosition';
import { SetSelectionContentArgs } from '../content/ContentTypes';
import { postProcessSetContent, preProcessSetContent } from '../content/PrePostProcess';
import * as MergeText from '../delete/MergeText';
import * as ScrollIntoView from '../dom/ScrollIntoView';
import { needsToBeNbspLeft, needsToBeNbspRight } from '../keyboard/Nbsps';

const removeEmpty = (text: SugarElement<Text>): Optional<SugarElement<Text>> => {
  if (text.dom.length === 0) {
    Remove.remove(text);
    return Optional.none();
  } else {
    return Optional.some(text);
  }
};

const walkPastBookmark = (node: Optional<SugarElement<Node>>, start: boolean): Optional<SugarElement<Node>> =>
  node.filter((elm) => BookmarkManager.isBookmarkNode(elm.dom))
    .bind(start ? Traverse.nextSibling : Traverse.prevSibling);

const merge = (outer: SugarElement<Text>, inner: SugarElement<Text>, rng: Range, start: boolean, schema: Schema) => {
  const outerElm = outer.dom;
  const innerElm = inner.dom;
  const oldLength = start ? outerElm.length : innerElm.length;
  if (start) {
    MergeText.mergeTextNodes(outerElm, innerElm, schema, false, !start);
    rng.setStart(innerElm, oldLength);
  } else {
    MergeText.mergeTextNodes(innerElm, outerElm, schema, false, !start);
    rng.setEnd(innerElm, oldLength);
  }
};

const normalizeTextIfRequired = (inner: SugarElement<Text>, start: boolean, schema: Schema) => {
  Traverse.parent(inner).each((root) => {
    const text = inner.dom;
    if (start && needsToBeNbspLeft(root, CaretPosition(text, 0), schema)) {
      MergeText.normalizeWhitespaceAfter(text, 0, schema);
    } else if (!start && needsToBeNbspRight(root, CaretPosition(text, text.length), schema)) {
      MergeText.normalizeWhitespaceBefore(text, text.length, schema);
    }
  });
};

const mergeAndNormalizeText = (outerNode: Optional<SugarElement<Text>>, innerNode: Optional<SugarElement<Node>>, rng: Range, start: boolean, schema: Schema) => {
  outerNode.bind((outer) => {
    // Normalize the text outside the inserted content
    const normalizer = start ? MergeText.normalizeWhitespaceBefore : MergeText.normalizeWhitespaceAfter;
    normalizer(outer.dom, start ? outer.dom.length : 0, schema);

    // Merge the inserted content with other text nodes
    return innerNode.filter(SugarNode.isText).map((inner) => merge(outer, inner, rng, start, schema));
  }).orThunk(() => {
    // Note: Attempt to leave the inserted/inner content as is and only adjust if absolutely required
    const innerTextNode = walkPastBookmark(innerNode, start).or(innerNode).filter(SugarNode.isText);
    return innerTextNode.map((inner) => normalizeTextIfRequired(inner, start, schema));
  });
};

const rngSetContent = (rng: Range, fragment: DocumentFragment, schema: Schema): void => {
  const firstChild = Optional.from(fragment.firstChild).map(SugarElement.fromDom);
  const lastChild = Optional.from(fragment.lastChild).map(SugarElement.fromDom);

  rng.deleteContents();
  rng.insertNode(fragment);

  const prevText = firstChild.bind(Traverse.prevSibling).filter(SugarNode.isText).bind(removeEmpty);
  const nextText = lastChild.bind(Traverse.nextSibling).filter(SugarNode.isText).bind(removeEmpty);

  // Join and normalize text
  mergeAndNormalizeText(prevText, firstChild, rng, true, schema);
  mergeAndNormalizeText(nextText, lastChild, rng, false, schema);

  rng.collapse(false);
};

const setupArgs = (args: Partial<SetSelectionContentArgs>, content: string): SetSelectionContentArgs => ({
  format: 'html',
  ...args,
  set: true,
  selection: true,
  content
});

const cleanContent = (editor: Editor, args: SetSelectionContentArgs) => {
  if (args.format !== 'raw') {
    // Find which context to parse the content in
    const rng = editor.selection.getRng();
    const contextBlock = editor.dom.getParent(rng.commonAncestorContainer, editor.dom.isBlock);
    const contextArgs = contextBlock ? { context: contextBlock.nodeName.toLowerCase() } : { };

    const node = editor.parser.parse(args.content, { forced_root_block: false, ...contextArgs, ...args });
    return HtmlSerializer({ validate: false }, editor.schema).serialize(node);
  } else {
    return args.content;
  }
};

const setContent = (editor: Editor, content: string, args: Partial<SetSelectionContentArgs> = {}): void => {
  const defaultedArgs = setupArgs(args, content);
  preProcessSetContent(editor, defaultedArgs).each((updatedArgs) => {
    // Sanitize the content
    const cleanedContent = cleanContent(editor, updatedArgs);

    const rng = editor.selection.getRng();
    rngSetContent(rng, rng.createContextualFragment(cleanedContent), editor.schema);
    editor.selection.setRng(rng);

    ScrollIntoView.scrollRangeIntoView(editor, rng);

    postProcessSetContent(editor, cleanedContent, updatedArgs);
  });
};

export {
  setContent
};
