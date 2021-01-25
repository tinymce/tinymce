import { SimRange, SugarElement } from '@ephox/sugar';
import { Editor } from '../alien/EditorTypes';

export interface TinyDom {
  readonly fromDom: (elm: Node) => SugarElement;
  readonly fromRange: (rng: Range) => SimRange;
  readonly body: (editor: Editor) => SugarElement<HTMLElement>;
  readonly document: (editor: Editor) => SugarElement<HTMLDocument>;
  readonly container: (editor: Editor) => SugarElement<HTMLElement>;
  readonly contentAreaContainer: (editor: Editor) => SugarElement<HTMLElement>;
  readonly targetElement: (editor: Editor) => SugarElement<HTMLElement>;
}

/**
 * @deprecated Use SugarElement.fromDom instead.
 */
const fromDom = (elm: Node): SugarElement<Node> =>
  SugarElement.fromDom(elm);

const fromRange = (rng: Range): SimRange =>
  SimRange.create(
    SugarElement.fromDom(rng.startContainer),
    rng.startOffset,
    SugarElement.fromDom(rng.endContainer), rng.endOffset
  );

const body = (editor: Editor): SugarElement<HTMLElement> =>
  SugarElement.fromDom(editor.getBody());

const document = (editor: Editor): SugarElement<HTMLDocument> =>
  SugarElement.fromDom(editor.getDoc());

const container = (editor: Editor): SugarElement<HTMLElement> =>
  SugarElement.fromDom(editor.getContainer());

const contentAreaContainer = (editor: Editor): SugarElement<HTMLElement> =>
  SugarElement.fromDom(editor.getContentAreaContainer());

const targetElement = (editor: Editor): SugarElement<HTMLElement> =>
  SugarElement.fromDom(editor.getElement());

export const TinyDom: TinyDom = {
  fromDom,
  fromRange,

  body,
  container,
  contentAreaContainer,
  document,
  targetElement
};
