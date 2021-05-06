import { Optional } from '@ephox/katamari';

type path = number[];

interface Editor {}

interface RtcAdaptor {
  raw: {
    getModel: () => Optional<any>;
    getModelApi: () => Optional<any>;
  };
}

interface RtcEditor extends Editor {
  rtcInstance: RtcAdaptor;
}

interface SlateLoc {
  node: {
    type: string;
    class: string;
    children: Array<SlateLoc>;
    parent: SlateLoc;
  };
}

interface SlateEditor {

}

interface ModelApi {
  body: {
    getBody: () => SlateLoc;
    getEditor: () => SlateEditor;
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

const getModelApi = (editor: RtcEditor): Optional<ModelApi> => editor.rtcInstance.raw.getModelApi();

export {
  getModelApi,
  ModelApi,
  path,
  SlateLoc,
  SlateEditor
};

