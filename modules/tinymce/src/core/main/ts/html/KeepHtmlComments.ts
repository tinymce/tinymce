export const encodeData = (data: string): string =>
  data.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const decodeData = (data: string): string =>
  data.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

export const encodeComments = (target: HTMLElement): void => {
  const walker = document.createTreeWalker(target, NodeFilter.SHOW_COMMENT);
  let node: Node | null;

  while ((node = walker.nextNode())) {
    const commentNode = node as Comment;
    commentNode.data = encodeData(commentNode.data);
  }
};

