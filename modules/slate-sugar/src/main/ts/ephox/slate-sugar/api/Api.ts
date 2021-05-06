import { Maybe } from '@ephox/katamari';

type path = number[];

interface Editor {}

interface RtcAdaptor {
  raw: {
    getModel: () => Maybe<any>;
    getModelApi: () => Maybe<ModelApi>;
  };
}

interface RtcEditor extends Editor {
  rtcInstance: RtcAdaptor;
}

interface SlateElement {
  type: string;
  children: Array<SlateNode>;
  class?: string;
}

interface SlateText {
  text: string;
}

type SlateNode = SlateElement | SlateText;

interface List<T>{
  hd: T;
  tl: List<T> | 0;
}

interface SlateLoc {
  node: SlateNode;
  parents: List<SlateLoc>;
}

interface SlateEditor {}

interface ModelApi {
  body: {
    getBody: () => SlateLoc;
    getEditor: () => SlateEditor;
  };
  modelNodeType: {
    isElement: (node: SlateNode) => node is SlateElement;
    isText: (node: SlateNode) => node is SlateText;
    isBlock: (node: SlateNode) => boolean;
    isInline: (node: SlateNode) => boolean;
  };
  nodeTransforms: {
    setPropsAtPath: (path: path, props: Record<string, string>) => void;
  };
  predicateFind: {
    closest: (loc: SlateLoc, predicate: (loc: SlateLoc) => boolean, isRoot: (loc: SlateLoc) => boolean) => SlateLoc;
  };
  predicateFilter: {
    descendants: (loc: SlateLoc, predicate: (loc: SlateLoc) => boolean) => SlateLoc[];
  };
  slateLoc: {
    toPathArray: (loc: SlateLoc) => path;
  };
}

const getModelApi = (editor: RtcEditor): Maybe<ModelApi> => editor.rtcInstance.raw.getModelApi();

export {
  getModelApi,
  ModelApi,
  path,
  SlateEditor,
  SlateElement,
  SlateLoc,
  SlateNode,
  SlateText
};

