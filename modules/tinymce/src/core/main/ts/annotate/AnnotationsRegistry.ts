import { Obj, Optional } from '@ephox/katamari';

import { Decorator } from './Wrapping';

export interface AnnotatorSettings {
  decorate: Decorator;
  persistent?: boolean;
}

export interface AnnotationsRegistry {
  register: (name: string, settings: AnnotatorSettings) => void;
  lookup: (name: string) => Optional<AnnotatorSettings>;
  getNames: () => string[];
}

interface Annotation {
  readonly name: string;
  readonly settings: AnnotatorSettings;
}

const create = (): AnnotationsRegistry => {
  const annotations: Record<string, Annotation> = { };

  const register = (name: string, settings: AnnotatorSettings): void => {
    annotations[name] = {
      name,
      settings
    };
  };

  const lookup = (name: string): Optional<AnnotatorSettings> =>
    Obj.get(annotations, name).map((a) => a.settings);

  const getNames = (): string[] => Obj.keys(annotations);

  return {
    register,
    lookup,
    getNames
  };
};

export {
  create
};
