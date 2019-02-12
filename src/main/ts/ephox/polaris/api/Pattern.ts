import Chars from '../pattern/Chars';
import Custom from '../pattern/Custom';
import Safe from '../pattern/Safe';
import Unsafe from '../pattern/Unsafe';

const safeword = Safe.word;

const safetoken = Safe.token;

const custom = Custom;

const unsafeword = Unsafe.word;

const unsafetoken = Unsafe.token;

const sanitise = Safe.sanitise;

const chars = Chars.chars;

const wordbreak = Chars.wordbreak;

const wordchar = Chars.wordchar;

export default {
  safeword,
  safetoken,
  custom,
  unsafeword,
  unsafetoken,
  sanitise,
  chars,
  wordbreak,
  wordchar
};