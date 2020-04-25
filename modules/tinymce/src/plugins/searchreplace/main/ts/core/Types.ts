/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Text } from '@ephox/dom-globals';
import { Element } from '@ephox/sugar';

export interface Pattern {
  readonly regex: RegExp;
  readonly matchIndex: number;
}

export interface Position {
  readonly start: number;
  readonly finish: number;
}

export interface TextSection {
  sOffset: number;
  fOffset: number;
  readonly elements: Element<Text>[];
}

export interface TextMatch extends Position {
  readonly element: Element<Text>;
}
