import { Arr, Id, Obj, Singleton, Unicode } from '@ephox/katamari';
import { Attribute, Class, Classes, Html, Insert, Replication, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as ExpandRange from '../fmt/ExpandRange';
import * as RangeWalk from '../selection/RangeWalk';
import * as SelectionUtils from '../selection/SelectionUtils';
import * as TableCellSelection from '../selection/TableCellSelection';
import { ChildContext, context } from './AnnotationContext';
import { AnnotatorSettings } from './AnnotationsRegistry';
import * as Markings from './Markings';

export type DecoratorData = Record<string, any>;

export type Decorator = (
  uid: string,
  data: DecoratorData
) => {
  attributes?: {};
  classes?: string[];
};

const applyWordGrab = (editor: Editor, rng: Range): void => {
  const r = ExpandRange.expandRng(editor.dom, rng, [{ inline: 'span' }]);
  rng.setStart(r.startContainer, r.startOffset);
  rng.setEnd(r.endContainer, r.endOffset);
  editor.selection.setRng(rng);
};

const applyAnnotation = (
  elem: SugarElement<Element>,
  masterUId: string,
  data: DecoratorData,
  annotationName: string,
  decorate: Decorator,
  directAnnotation: boolean
): void => {
  const { uid = masterUId, ...otherData } = data;
  Class.add(elem, Markings.annotation());
  Attribute.set(elem, `${Markings.dataAnnotationId()}`, uid);
  Attribute.set(elem, `${Markings.dataAnnotation()}`, annotationName);

  const { attributes = {}, classes = [] } = decorate(uid, otherData);
  Attribute.setAll(elem, attributes);
  Classes.add(elem, classes);

  if (directAnnotation) {
    if (classes.length > 0) {
      Attribute.set(elem, `${Markings.dataAnnotationClasses()}`, classes.join(','));
    }
    const attributeNames = Obj.keys(attributes);
    if (attributeNames.length > 0) {
      Attribute.set(elem, `${Markings.dataAnnotationAttributes()}`, attributeNames.join(','));
    }
  }
};

const removeDirectAnnotation = (elem: SugarElement<Element>): void => {
  Class.remove(elem, Markings.annotation());
  Attribute.remove(elem, `${Markings.dataAnnotationId()}`);
  Attribute.remove(elem, `${Markings.dataAnnotation()}`);
  Attribute.remove(elem, `${Markings.dataAnnotationActive()}`);

  const customAttrNames = Attribute.getOpt(elem, `${Markings.dataAnnotationAttributes()}`).map((names) => names.split(',')).getOr([]);
  const customClasses = Attribute.getOpt(elem, `${Markings.dataAnnotationClasses()}`).map((names) => names.split(',')).getOr([]);
  Arr.each(customAttrNames, (name) => Attribute.remove(elem, name));
  Classes.remove(elem, customClasses);
  Attribute.remove(elem, `${Markings.dataAnnotationClasses()}`);
  Attribute.remove(elem, `${Markings.dataAnnotationAttributes()}`);
};

const makeAnnotation = (eDoc: Document, uid: string, data: DecoratorData, annotationName: string, decorate: Decorator): SugarElement<HTMLSpanElement> => {
  const master = SugarElement.fromTag('span', eDoc);
  applyAnnotation(master, uid, data, annotationName, decorate, false);
  return master;
};

const annotate = (editor: Editor, rng: Range, uid: string, annotationName: string, decorate: Decorator, data: DecoratorData): SugarElement<HTMLSpanElement>[] => {
  // Setup all the wrappers that are going to be used.
  const newWrappers: SugarElement<HTMLSpanElement>[] = [];

  // Setup the spans for the comments
  const master = makeAnnotation(editor.getDoc(), uid, data, annotationName, decorate);

  // Set the current wrapping element
  const wrapper = Singleton.value<SugarElement<HTMLSpanElement>>();

  // Clear the current wrapping element, so that subsequent calls to
  // getOrOpenWrapper spawns a new one.
  const finishWrapper = () => {
    wrapper.clear();
  };

  // Get the existing wrapper, or spawn a new one.
  const getOrOpenWrapper = (): SugarElement<HTMLSpanElement> =>
    wrapper.get().getOrThunk(() => {
      const nu = Replication.shallow(master);
      newWrappers.push(nu);
      wrapper.set(nu);
      return nu;
    });

  const processElements = (elems: SugarElement<Node>[]) => {
    Arr.each(elems, processElement);
  };

  const processElement = (elem: SugarElement<Node>) => {
    const ctx = context(editor, elem, 'span', SugarNode.name(elem));

    switch (ctx) {
      case ChildContext.InvalidChild: {
        finishWrapper();
        const children = Traverse.children(elem);
        processElements(children);
        finishWrapper();
        break;
      }

      case ChildContext.ValidBlock: {
        finishWrapper();
        applyAnnotation(elem as SugarElement<Element>, uid, data, annotationName, decorate, true);
        break;
      }

      case ChildContext.Valid: {
        const w = getOrOpenWrapper();
        Insert.wrap(elem, w);
        break;
      }

      // INVESTIGATE: Are these sensible things to do?
      case ChildContext.Skipping:
      case ChildContext.Existing:
      case ChildContext.Caret: {
        // Do nothing.
      }
    }
  };

  const processNodes = (nodes: Node[]) => {
    const elems = Arr.map(nodes, SugarElement.fromDom);
    processElements(elems);
  };

  RangeWalk.walk(editor.dom, rng, (nodes) => {
    finishWrapper();
    processNodes(nodes);
  });

  return newWrappers;
};

const annotateWithBookmark = (editor: Editor, name: string, settings: AnnotatorSettings, data: {}): void => {
  editor.undoManager.transact(() => {
    const selection = editor.selection;
    const initialRng = selection.getRng();
    const hasFakeSelection = TableCellSelection.getCellsFromEditor(editor).length > 0;
    const masterUid = Id.generate('mce-annotation');

    if (initialRng.collapsed && !hasFakeSelection) {
      applyWordGrab(editor, initialRng);
    }

    // Even after applying word grab, we could not find a selection. Therefore,
    // just make a wrapper and insert it at the current cursor
    if (selection.getRng().collapsed && !hasFakeSelection) {
      const wrapper = makeAnnotation(editor.getDoc(), masterUid, data, name, settings.decorate);
      // Put something visible in the marker
      Html.set(wrapper, Unicode.nbsp);
      selection.getRng().insertNode(wrapper.dom);
      selection.select(wrapper.dom);
    } else {
      // The bookmark is responsible for splitting the nodes beforehand at the selection points
      // The "false" here means a zero width cursor is NOT put in the bookmark. It seems to be required
      // to stop an empty paragraph splitting into two paragraphs. Probably a better way exists.
      SelectionUtils.preserve(selection, false, () => {
        SelectionUtils.runOnRanges(editor, (selectionRng) => {
          annotate(editor, selectionRng, masterUid, name, settings.decorate, data);
        });
      });
    }
  });
};

export {
  removeDirectAnnotation,
  annotateWithBookmark
};
