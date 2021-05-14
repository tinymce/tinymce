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

interface ModelElement {
  type: string;
  children: Array<ModelNode>;
  class?: string;
}

interface ModelText {
  text: string;
}

type ModelNode = ModelElement | ModelText;

interface ModelLocation {
  node: ModelNode;
  parents: Array<ModelLocation>;
}

interface ModelApi {
  body: {
    getBody: () => ModelLocation;
  };
  modelNodeType: {
    isElement: (node: ModelNode) => node is ModelElement;
    isText: (node: ModelNode) => node is ModelText;
    isBlock: (node: ModelNode) => boolean;
    isInline: (node: ModelNode) => boolean;
  };
  nodeTransforms: {
    setPropsAtPath: (path: path, props: Record<string, string>) => void;
  };
  predicateFind: {
    closest: (loc: ModelLocation, predicate: (loc: ModelLocation) => boolean, isRoot: (loc: ModelLocation) => boolean) => ModelLocation;
  };
  predicateFilter: {
    descendants: (loc: ModelLocation, predicate: (loc: ModelLocation) => boolean) => ModelLocation[];
  };
  path: {
    modelLocationToPath: (loc: ModelLocation) => path;
  };
}

const getModelApi = (editor: RtcEditor): Maybe<ModelApi> => editor.rtcInstance.raw.getModelApi();

export {
  getModelApi,
  ModelApi,
  path,
  ModelElement,
  ModelLocation,
  ModelNode,
  ModelText
};
