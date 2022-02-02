/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Obj, Optional } from '@ephox/katamari';

import { Decorator } from './Wrapping';

export interface AnnotatorSettings {
  decorate: Decorator;
  persistent?: boolean;
}

export interface AnnotationsRegistry {
  register: (name: string, settings: AnnotatorSettings) => void;
  lookup: (name: string) => Optional<AnnotatorSettings>;
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

  return {
    register,
    lookup
  };
};

export {
  create
};
