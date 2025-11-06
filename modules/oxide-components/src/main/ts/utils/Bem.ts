import { Arr, Obj, Strings, Type } from '@ephox/katamari';
import type { Classes } from '@tinymce/oxide/skins/ui/default/skin.ts';

type ValidClassName = keyof Classes;

type BlockElementModifier<K extends string> = K extends `${string}__${string}--${string}` ? K : never;
type BlockElement<K extends string> = K extends `${string}__${string}` ? (K extends `${string}--${string}` ? never : K) : never;
type BlockModifier<K extends string> = K extends `${string}--${string}` ? (K extends `${string}__${string}` ? never : K) : never;
type Block<K extends string> = K extends `${string}__${string}` | `${string}--${string}` ? never : K;

type BEMBlocks = Extract<ValidClassName, Block<ValidClassName>>;
type BEMBlockModifiers = Extract<ValidClassName, BlockModifier<ValidClassName>>;
type BEMBlockElements = Extract<ValidClassName, BlockElement<ValidClassName>>;
type BEMBlockElementModifiers = Extract<ValidClassName, BlockElementModifier<ValidClassName>>;

type SplitBlockElement<K extends string> = K extends `${infer Block}__${infer Element}` ? [Block, Element] : never;
type ValidElementPairs = SplitBlockElement<BEMBlockElements>;
type ElementForBlock<B extends BEMBlocks> = Extract<ValidElementPairs, [B, any]>[1];

type SplitBlockModifier<K extends string> = K extends `${infer Block}--${infer Modifier}` ? [Block, Modifier] : never;
type SplitBlockElementModifier<K extends string> = K extends `${infer Block}__${infer Element}--${infer Modifier}` ? [Block, Element, Modifier] : never;

type ValidBlockModifiers = SplitBlockModifier<BEMBlockModifiers>;
type ValidBlockElementModifiers = SplitBlockElementModifier<BEMBlockElementModifiers>;

type ModifiersForBlock<B extends BEMBlocks> = Extract<ValidBlockModifiers, [B, any]>[1];
type ModifiersForBlockElement<B extends BEMBlocks, E extends ElementForBlock<B>> = Extract<ValidBlockElementModifiers, [B, E, any]>[2];
type ModifierRecord<M extends string> = [M] extends [never] ? never : Partial<Record<M, boolean>>; // To avoid 'Record<never, boolean>' which is an empty object

const applyModifiers = <M extends string>(joiner: string, base: string, modifiers: ModifierRecord<M>): string => {
  const modifierClasses = Arr.filter(Obj.mapToArray(modifiers, (v, k) => v ? `${base}--${k}` : ''), Strings.isNotEmpty);
  return [ base, ...modifierClasses ].join(joiner);
};

export const block = <B extends BEMBlocks, M extends ModifiersForBlock<B> = never>(
  block: B,
  modifiers?: ModifierRecord<M>
): string => Type.isUndefined(modifiers) ? block : applyModifiers(' ', block, modifiers);

export const element = <B extends BEMBlocks, E extends ElementForBlock<B>, M extends ModifiersForBlockElement<B, E> = never>(
  block: B,
  element: E,
  modifiers?: ModifierRecord<M>
): string => {
  const base = `${block}__${element}`;
  return Type.isUndefined(modifiers) ? base : applyModifiers(' ', base, modifiers);
};

export const blockSelector = <B extends BEMBlocks, M extends ModifiersForBlock<B> = never>(
  block: B,
  modifiers?: ModifierRecord<M>
): string => {
  const base = `.${block}`;
  return Type.isUndefined(modifiers) ? base : applyModifiers('', base, modifiers);
};

export const elementSelector = <B extends BEMBlocks, E extends ElementForBlock<B>, M extends ModifiersForBlockElement<B, E> = never>(
  block: B,
  element: E,
  modifiers?: ModifierRecord<M>
): string => {
  const base = `.${block}__${element}`;
  return Type.isUndefined(modifiers) ? base : applyModifiers('', base, modifiers);
};
