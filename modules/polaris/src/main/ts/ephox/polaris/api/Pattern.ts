import { Option } from '@ephox/katamari';
import * as Chars from '../pattern/Chars';
import { Custom } from '../pattern/Custom';
import * as Safe from '../pattern/Safe';
import { PRegExp } from '../pattern/Types';
import * as Unsafe from '../pattern/Unsafe';

type SafewordApi = (input: string) => PRegExp;
const safeword: SafewordApi = Safe.word;

type SafeTokenApi = (input: string) => PRegExp;
const safetoken: SafeTokenApi = Safe.token;

type CustomApi = (regex: string, prefix: (match: RegExpExecArray) => number, suffix: (match: RegExpExecArray) => number, flags: Option<string>) => PRegExp;
const custom: CustomApi = Custom;

type UnsafewordApi = (input: string) => PRegExp;
const unsafeword: UnsafewordApi = Unsafe.word;

type UnsafetokenApi = (input: string) => PRegExp;
const unsafetoken: UnsafetokenApi = Unsafe.token;

type SanitiseApi = (input: string) => string;
const sanitise: SanitiseApi = Safe.sanitise;

type CharsApi = () => string;
const chars: CharsApi = Chars.chars;

type WordbreakApi = () => string;
const wordbreak: WordbreakApi = Chars.wordbreak;

type WordcharApi = () => string;
const wordchar: WordcharApi = Chars.wordchar;

type PunctuationApi = () => string;
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
