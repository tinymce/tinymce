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

export interface DynamicPatternContext {
  readonly text: string; // the string from the start of the block to the cursor
  readonly block: Element; // the parent block element
}

export type DynamicPatternsLookup = (ctx: DynamicPatternContext) => Pattern[];
export type RawDynamicPatternsLookup = (ctx: DynamicPatternContext) => RawPattern[];

// NOTE: A PatternSet should be looked up from the Options *each* time that text_patterns are
// processed, so that text_patterns respond to changes in options. This is required for some
// complex integrations and plugins.
export interface PatternSet {
  readonly inlinePatterns: InlinePattern[];
  readonly blockPatterns: BlockPattern[];
  readonly dynamicPatternsLookup: DynamicPatternsLookup;
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
