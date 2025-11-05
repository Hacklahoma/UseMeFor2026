import { ParsedName } from '../types';

/**
 * Parses a name input string into first and last name
 * First word is always treated as first name
 * Remaining words are treated as last name
 * @param nameInput - The full name input string
 * @returns Object containing firstName and lastName
 */
export const parseName = (nameInput: string): ParsedName => {
  const parts = nameInput.trim().split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
};

