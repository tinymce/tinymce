import { SimRange, SugarElement } from '@ephox/sugar';
import { Editor } from '../alien/EditorTypes';

export interface TinyDom {
  fromDom: (elm: Node) => SugarElement;
  fromRange: (rng: Range) => SimRange;
  body: (editor: Editor) => SugarElement<HTMLElement>;
  document: (editor: Editor) => SugarElement<HTMLDocument>;
}

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

export const TinyDom: TinyDom = {
  fromDom,
  fromRange,
  body,
  document
};
