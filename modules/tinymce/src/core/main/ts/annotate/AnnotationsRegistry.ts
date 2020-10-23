/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';
import { Decorator } from './Wrapping';

export interface AnnotatorSettings {
  decorate: Decorator;
  persistent?: boolean;
}

export interface AnnotationsRegistry {
  register: (name: string, settings: AnnotatorSettings) => void;
  lookup: (name: string) => Optional<AnnotatorSettings>;
}

const create = (): AnnotationsRegistry => {
  const annotations = { };

  const register = (name: string, settings: AnnotatorSettings): void => {
    annotations[name] = {
      name,
      settings
    };
  };

  const lookup = (name: string): Optional<AnnotatorSettings> => annotations.hasOwnProperty(name) ? Optional.from(annotations[name]).map((a) => a.settings) : Optional.none();

  return {
    register,
    lookup
  };
};

export {
  create
};
