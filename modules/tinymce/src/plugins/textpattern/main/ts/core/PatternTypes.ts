/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { PathRange } from '../utils/PathRange';

export interface RawPattern {
  start?: any;
  end?: any;
  format?: any;
  cmd?: any;
  value?: any;
  replacement?: any;
}

export interface PatternError {
  message: string;
  pattern: RawPattern;
}

interface InlineBasePattern {
  start: string;
  end: string;
}

export interface InlineFormatPattern extends InlineBasePattern {
  type: 'inline-format';
  format: string[];
}

export interface InlineCmdPattern extends InlineBasePattern {
  type: 'inline-command';
  cmd: string;
  value?: any;
}

export type InlinePattern = InlineFormatPattern | InlineCmdPattern;

interface BlockBasePattern {
  start: string;
}

export interface BlockFormatPattern extends BlockBasePattern {
  type: 'block-format';
  format: string;
}

export interface BlockCmdPattern extends BlockBasePattern {
  type: 'block-command';
  cmd: string;
  value?: any;
}

export type BlockPattern = BlockFormatPattern | BlockCmdPattern;

export type Pattern = InlinePattern | BlockPattern;

export interface PatternSet {
  inlinePatterns: InlinePattern[];
  blockPatterns: BlockPattern[];
}

interface PatternMatch<T extends Pattern> {
  pattern: T;
}

export interface BlockPatternMatch extends PatternMatch<BlockPattern> {
  range: PathRange;
}

export interface InlinePatternMatch extends PatternMatch<InlinePattern> {
  startRng: PathRange;
  endRng: PathRange;
}
