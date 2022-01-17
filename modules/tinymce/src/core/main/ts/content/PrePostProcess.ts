/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Result } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Events from '../api/Events';
import AstNode from '../api/html/Node';
import { Content, GetContentArgs, SetContentArgs } from './ContentTypes';

const preProcessGetContent = <T extends GetContentArgs>(editor: Editor, args: T): Result<T, Content> => {
  if (args.no_events) {
    return Result.value(args);
  } else {
    const eventArgs = Events.fireBeforeGetContent(editor, args);
    if (eventArgs.isDefaultPrevented()) {
      const defaultContent = eventArgs.format === 'tree' ? new AstNode('body', 11) : '';
      return Result.error(Events.fireGetContent(editor, { content: defaultContent, ...eventArgs }).content);
    } else {
      return Result.value(eventArgs);
    }
  }
};

const postProcessGetContent = <T extends GetContentArgs>(editor: Editor, content: Content, args: T): Content => {
  if (args.no_events) {
    return content;
  } else {
    const eventArgs = Events.fireGetContent(editor, { ...args, content });
    return eventArgs.content;
  }
};

const preProcessSetContent = <T extends SetContentArgs>(editor: Editor, args: T): Result<T, undefined> => {
  if (args.no_events) {
    return Result.value(args);
  } else {
    const eventArgs = Events.fireBeforeSetContent(editor, args);
    if (eventArgs.isDefaultPrevented()) {
      Events.fireSetContent(editor, eventArgs);
      return Result.error(undefined);
    } else {
      return Result.value(eventArgs);
    }
  }
};

const postProcessSetContent = <T extends SetContentArgs>(editor: Editor, content: string, args: T): void => {
  if (!args.no_events) {
    Events.fireSetContent(editor, { ...args, content });
  }
};

export {
  preProcessGetContent,
  postProcessGetContent,
  preProcessSetContent,
  postProcessSetContent
};
