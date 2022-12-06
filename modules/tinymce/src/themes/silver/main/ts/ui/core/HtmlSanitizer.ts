/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import createDompurify from 'dompurify';

export const sanitizeHtmlString = (html: string): string => createDompurify().sanitize(html);
