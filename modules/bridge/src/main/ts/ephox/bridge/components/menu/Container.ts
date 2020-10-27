import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { CardItem } from '../../api/Menu';
import { autocompleteSchema } from './Autocomplete';
import { CardItemsSpec } from './CardMenuItem';
import { descriptionSchema } from './Description';
import { imageSchema } from './Image';

export interface ContainerSpec {
  type: 'container';
  direction?: 'vertical' | 'horizontal';
  items: CardItemsSpec[];
}

export interface Container {
  type: 'container';
  direction: 'vertical' | 'horizontal';
  items: CardItem[];
}

export const itemSchema = ValueSchema.valueThunkOf(
  () => ValueSchema.chooseProcessor('type', {
    image: imageSchema,
    description: descriptionSchema,
    autocomplete: autocompleteSchema,
    container: containerSchema
  })
);

export const containerSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  FieldSchema.defaultedString('direction', 'horizontal'),
  FieldSchema.strictArrayOf('items', itemSchema)
]);

export const createContainer = (spec: ContainerSpec): Result<Container, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<Container>('container', containerSchema, spec);
