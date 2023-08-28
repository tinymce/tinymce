import { Obj } from '@ephox/katamari';

interface EditorResources {
  add(idName: string, data: string): void;
  get(idName: string): string | undefined;
  getIds(): string[];
}

const EditorResources = (): EditorResources => {
  const resources: Record<string, string> = {};

  const exports: EditorResources = {
    add: (idName: string, data: string): void => {
      resources[idName] = data;
    },
    get: (idName: string): string | undefined => {
      return resources[idName];
    },
    getIds: () => {
      return Obj.values(resources);
    }
  };

  return exports;
};

export default EditorResources;
