interface CollectionItem {
  type: string;
  text: string;
  icon: string;
  value: string;
}

export interface Setup {
  toCollectionItem: () => Array<CollectionItem>;
}