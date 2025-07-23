/* eslint-disable no-console */
import { Type } from '@ephox/katamari';

import Editor from './api/Editor';

type ConsoleMessageType = 'error' | 'warn' | 'log' | 'info';
interface ConsoleMessage {
  readonly type: ConsoleMessageType;
  readonly message: string;
};
type EditorMessageType = 'error' | 'info' | 'warning' | 'success';
interface EditorMessage {
  readonly type?: EditorMessageType;
  readonly message: string;
}

export interface Message {
  readonly console?: ConsoleMessage;
  readonly editor?: EditorMessage;
}

const displayNotification = (editor: Editor, messageData: EditorMessage) => {
  const { type, message } = messageData;
  editor.notificationManager.open({
    type,
    text: message
  });
};

const getConsoleFn = (type: ConsoleMessageType) => {
  switch (type) {
    case 'error':
      return console.error;
    case 'info':
      return console.info;
    case 'warn':
      return console.warn;
    case 'log':
    default:
      return console.log;
  }
};

const displayConsoleMessage = (messageData: ConsoleMessage) => {
  const consoleFn = getConsoleFn(messageData.type);
  consoleFn(messageData.message);
};

const reportMessage = (editor: Editor, message: Message): void => {
  const { console, editor: editorUi } = message;

  if (Type.isNonNullable(editorUi)) {

    if (editor._skinLoaded) {
      displayNotification(editor, editorUi);
    } else {
      editor.on('SkinLoaded', () => {
        displayNotification(editor, editorUi);
      });
    }
  }

  if (Type.isNonNullable(console)) {
    displayConsoleMessage(console);
  }
};

export {
  reportMessage
};

