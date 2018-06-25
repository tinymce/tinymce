import { Decorator } from './Wrapping';
import { Option } from '@ephox/katamari';

export interface AnnotatorSettings {
  decorate: Decorator;
  persistent?: boolean;
}

export interface AnnotationsRegistry {
  register: (name: string, settings: AnnotatorSettings) => void;
  lookup: (name: string) => Option<AnnotatorSettings>;
}

const create = (): AnnotationsRegistry => {
  const annotations = { };

  const register = (name: string, settings: AnnotatorSettings): void => {
    annotations[name] = {
      name,
      settings
    };
  };

  const lookup = (name: string): Option<AnnotatorSettings> => {
    return annotations.hasOwnProperty(name) ? Option.from(annotations[name]).map((a) => a.settings) : Option.none();
  };

  return {
    register,
    lookup
  };
};

export {
  create
};