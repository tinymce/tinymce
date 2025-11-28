// Keep this file in sync between `agar` and `agar-sw`. Cross‑importing proved too painful.

import { Type } from '@ephox/katamari';

export type LogLevel = 'info' | 'debug';

export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export interface MockingStartMessage {
  readonly type: 'AGAR_MOCKING_START';
  readonly logLevel: LogLevel;
}

export interface MockingStartedMessage {
  readonly type: 'AGAR_MOCKING_STARTED';
}

export interface MockingStopMessage {
  readonly type: 'AGAR_MOCKING_STOP';
}

export interface MockingStoppedMessage {
  readonly type: 'AGAR_MOCKING_STOPPED';
}

export interface MockRequestMessage {
  readonly type: 'AGAR_MOCKED_REQUEST';
  readonly requestId: UUID;
  readonly method: string;
  readonly url: string;
  readonly headers: Record<string, string>;
  readonly body: ArrayBuffer;
}

export interface MockedResponseHeadMessage {
  readonly type: 'AGAR_MOCKED_RESPONSE_HEAD';
  readonly requestId: UUID;
  readonly status: number;
  readonly statusText: string;
  readonly headers: Record<string, string>;
}

export interface MockedResponseBodyChunkMessage {
  readonly type: 'AGAR_MOCKED_RESPONSE_BODY_CHUNK';
  readonly buffer: ArrayBuffer;
}

export interface MockedResponseBodyDoneMessage {
  readonly type: 'AGAR_MOCKED_RESPONSE_BODY_DONE';
}

export interface MockedRequestAbortedMessage {
  readonly type: 'AGAR_MOCKED_REQUEST_ABORTED';
  readonly requestId: UUID;
}

export interface MockedRequestResponseChunkMessage {
  readonly type: 'AGAR_MOCKED_REQUEST_RESPONSE_CHUNK';
  readonly requestId: UUID;
}

export const mockPrefix = '/custom/';

const isMessageOfType = <T extends { type: string }>(type: T['type']) => (data: unknown): data is T =>
  Type.isObject(data) && (data as any).type === type;

export const isMockingStartMessage = isMessageOfType<MockingStartMessage>('AGAR_MOCKING_START');
export const isMockingStartedMessage = isMessageOfType<MockingStartedMessage>('AGAR_MOCKING_STARTED');
export const isMockingStopMessage = isMessageOfType<MockingStopMessage>('AGAR_MOCKING_STOP');
export const isMockingStoppedMessage = isMessageOfType<MockingStoppedMessage>('AGAR_MOCKING_STOPPED');
export const isMockRequestMessage = isMessageOfType<MockRequestMessage>('AGAR_MOCKED_REQUEST');
export const isMockedResponseHeadMessage = isMessageOfType<MockedResponseHeadMessage>('AGAR_MOCKED_RESPONSE_HEAD');
export const isMockedResponseBodyChunkMessage = isMessageOfType<MockedResponseBodyChunkMessage>('AGAR_MOCKED_RESPONSE_BODY_CHUNK');
export const isMockedResponseBodyDoneMessage = isMessageOfType<MockedResponseBodyDoneMessage>('AGAR_MOCKED_RESPONSE_BODY_DONE');
export const isMockedRequestAbortedMessage = isMessageOfType<MockedRequestAbortedMessage>('AGAR_MOCKED_REQUEST_ABORTED');
export const isMockedRequestResponseChunkMessage = isMessageOfType<MockedRequestResponseChunkMessage>('AGAR_MOCKED_REQUEST_RESPONSE_CHUNK');

export const getHeaders = (headers: Headers): Record<string, string> => {
  const result: Record<string, string> = {};

  headers.forEach((value, key) => {
    result[key] = value;
  });

  return result;
};
