import { Optional } from '@ephox/katamari';

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

interface ModelApi {
  getBody: () => SlateLoc;
  predicateFind: {
    closest: (node: SlateLoc, predicate: (node: SlateLoc) => boolean, isRoot: (node: SlateLoc) => boolean) => SlateLoc;
  };
  predicateFilter: {
    descendants: (node: SlateLoc, predicate: (node: SlateLoc) => boolean) => SlateLoc[];
  };
}

const getModelApi = (editor: RtcEditor): Optional<ModelApi> => editor.rtcInstance.raw.getModelApi();

export {
  SlateLoc,
  ModelApi,
  getModelApi
};

