import type { CardContainer, CardContainerSpec } from './CardContainer';
import type { CardImage, CardImageSpec } from './CardImage';
import type { CardText, CardTextSpec } from './CardText';

export type CardItemSpec =
  CardContainerSpec |
  CardImageSpec |
  CardTextSpec;

export type CardItem =
  CardContainer |
  CardImage |
  CardText;