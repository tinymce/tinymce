import { fileURLToPath } from 'node:url';

const here = (file: string): string => fileURLToPath(new URL(file, import.meta.url));

export const managerEntries = (entries: string[] = []): string[] => [ ...entries, here('./manager.ts') ];

export const previewAnnotations = (entries: string[] = []): string[] => [ ...entries, here('./preview.ts') ];
