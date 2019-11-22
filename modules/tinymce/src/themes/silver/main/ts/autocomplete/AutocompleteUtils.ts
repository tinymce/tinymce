/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Range } from '@ephox/dom-globals';

export const isValidTextRange = (rng: Range): boolean => rng.collapsed && rng.startContainer.nodeType === 3;

// Normalize the text by replacing non-breaking spaces with regular spaces and stripping zero-width spaces (fake carets).
export const getText = (rng: Range) => rng.toString().replace(/\u00A0/g, ' ').replace(/\uFEFF/g, '');

export const isWhitespace = (chr: string) => chr !== '' && ' \u00a0\f\n\r\t\v'.indexOf(chr) !== -1;
