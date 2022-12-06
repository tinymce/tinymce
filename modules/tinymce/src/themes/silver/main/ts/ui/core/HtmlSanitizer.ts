import createDompurify from 'dompurify';

export const sanitizeHtmlString = (html: string): string => createDompurify().sanitize(html);
