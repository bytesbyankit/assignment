import { createHash } from 'crypto';

/**
 * Computes SHA-256 hash of a string.
 */
export const computeHash = (data: string): string => {
    return createHash('sha256').update(data).digest('hex');
};
