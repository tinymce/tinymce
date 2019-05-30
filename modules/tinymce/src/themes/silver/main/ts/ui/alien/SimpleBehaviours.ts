/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AddEventsBehaviour, Behaviour } from '@ephox/alloy';
import { Id } from '@ephox/katamari';

// Consider moving to alloy once it takes shape.

const namedEvents = (name, handlers) => {
  return Behaviour.derive([
    AddEventsBehaviour.config(name, handlers)
  ]);
};

const unnamedEvents = (handlers) => {
  return namedEvents(Id.generate('unnamed-events'), handlers);
};

export const SimpleBehaviours = {
  namedEvents,
  unnamedEvents
};