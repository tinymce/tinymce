/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Disabling } from '@ephox/alloy';

const item = (disabled: boolean) => Disabling.config({
  disabled,
  disableClass: 'tox-collection__item--state-disabled'
});

const button = (disabled: boolean) => Disabling.config({
  disabled
});

const splitButton = (disabled: boolean) => Disabling.config({
  disabled,
  disableClass: 'tox-tbtn--disabled'
});

export const DisablingConfigs = {
  item,
  button,
  splitButton
};