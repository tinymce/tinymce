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
  readonly message: string;
  readonly pattern: RawPattern;
}

interface InlineBasePattern {
  readonly start: string;
  readonly end: string;
}

export interface InlineFormatPattern extends InlineBasePattern {
  readonly type: 'inline-format';
  readonly format: string[];
}

export interface InlineCmdPattern extends InlineBasePattern {
  readonly type: 'inline-command';
  readonly cmd: string;
  readonly value?: any;
}

export type InlinePattern = InlineFormatPattern | InlineCmdPattern;

interface BlockBasePattern {
  readonly start: string;
}

export interface BlockFormatPattern extends BlockBasePattern {
  readonly type: 'block-format';
  readonly format: string;
}

export interface BlockCmdPattern extends BlockBasePattern {
  readonly type: 'block-command';
  readonly cmd: string;
  readonly value?: any;
}

export type BlockPattern = BlockFormatPattern | BlockCmdPattern;

export type Pattern = InlinePattern | BlockPattern;

export interface PatternSet {
  readonly inlinePatterns: InlinePattern[];
  readonly blockPatterns: BlockPattern[];
}

interface PatternMatch<T extends Pattern> {
  readonly pattern: T;
}

export interface BlockPatternMatch extends PatternMatch<BlockPattern> {
  readonly range: PathRange;
}

export interface InlinePatternMatch extends PatternMatch<InlinePattern> {
  readonly startRng: PathRange;
  readonly endRng: PathRange;
}
