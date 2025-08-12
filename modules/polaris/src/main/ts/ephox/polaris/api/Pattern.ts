import type { Optional } from '@ephox/katamari';

import * as Chars from '../pattern/Chars';
import { Custom } from '../pattern/Custom';
import * as Safe from '../pattern/Safe';
import type { PRegExp } from '../pattern/Types';
import * as Unsafe from '../pattern/Unsafe';

type SafeTokenApi = (input: string) => PRegExp;

type CustomApi = (regex: string, prefix: (match: RegExpExecArray) => number, suffix: (match: RegExpExecArray) => number, flags: Optional<string>) => PRegExp;

type UnsafewordApi = (input: string) => PRegExp;

type UnsafetokenApi = (input: string) => PRegExp;

type SanitiseApi = (input: string) => string;

type CharsApi = () => string;

type WordbreakApi = () => string;

type WordcharApi = () => string;

type PunctuationApi = () => string;

type SafewordApi = (input: string) => PRegExp;
const safeword: SafewordApi = Safe.word;

const safetoken: SafeTokenApi = Safe.token;

const custom: CustomApi = Custom;

const unsafeword: UnsafewordApi = Unsafe.word;

const unsafetoken: UnsafetokenApi = Unsafe.token;

const sanitise: SanitiseApi = Safe.sanitise;

const chars: CharsApi = Chars.chars;

const wordbreak: WordbreakApi = Chars.wordbreak;

const wordchar: WordcharApi = Chars.wordchar;

const punctuation: PunctuationApi = Chars.punctuation;

export {
  safeword,
  safetoken,
  custom,
  unsafeword,
  unsafetoken,
  sanitise,
  chars,
  wordbreak,
  wordchar,
  punctuation
};