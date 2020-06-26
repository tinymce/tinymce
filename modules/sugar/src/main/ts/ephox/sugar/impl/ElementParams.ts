import Element from '../api/node/Element';
import { Fun } from '@ephox/katamari';

const foo = Fun.constant(Fun.identity);


/*
TS can convert `Element<A & B> => Element<A>` but not `Option<Element<A & B>> => Option<Element<A>>`.
These functions can help. Map your `Option<Element>>` values over them to get out of tricky type situations.

Not currently API, but could be made API if we feel
*/

export const narrowL: <A, B> () => (e: Element<A & B>) => Element<A> = foo;

export const narrowR: <A, B> () => (e: Element<A & B>) => Element<B> = foo;

export const weaken: <A, B extends A> () => (e: Element<B>) => Element<A> = foo;

export const widenL: <A, B> () => (e: Element<B>) => Element<A | B> = foo;

export const widenR: <A, B> () => (e: Element<A>) => Element<A | B> = foo;
