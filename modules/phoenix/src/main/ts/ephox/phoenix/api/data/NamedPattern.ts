import { Struct } from '@ephox/katamari';
import { PRegExp } from '@ephox/polaris';

export interface NamedPattern {
  word(): string;
  pattern(): PRegExp;
}
type NamedPatternConstructor = (word: string, pattern: PRegExp) => NamedPattern;

export const NamedPattern = <NamedPatternConstructor> Struct.immutable('word', 'pattern');
