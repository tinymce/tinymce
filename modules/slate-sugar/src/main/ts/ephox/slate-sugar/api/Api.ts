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
  attribute: {
    getAttribute: (node: ModelNode, key: string) => string;
    hasAttribute: (node: ModelNode, key: string) => boolean;
    getAttributes: (node: ModelNode) => Record<string, string>;
    removeAttributesByPath: (path: path, keys: string[]) => void;
    setAttributesByPath: (path: path, attrs: Record<string, string>) => void;
  };
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
    setPropsByPath: (path: path, props: Record<string, string>) => void;
    removePropsByPath: (path: path, props: string[]) => void;
  };
  predicateFind: {
    closest: (loc: ModelLocation, predicate: (loc: ModelLocation) => boolean, isRoot: (loc: ModelLocation) => boolean) => ModelLocation;
  };
  predicateFilter: {
    descendants: (loc: ModelLocation, predicate: (loc: ModelLocation) => boolean) => ModelLocation[];
  };
  path: {
    modelLocationToPath: (loc: ModelLocation) => path;
    pathToModelLocation: (path: path) => ModelLocation;
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
