import { type Classes } from '@tinymce/oxide/skins/ui/default/skin.ts';

export const classes = (classNames: Array<keyof Classes>): string => classNames.join(' ');
