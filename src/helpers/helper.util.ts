/**
 * @license MIT
 * @copyright
 * Hilario Junior Nengare 2025
 */

'use strict';

/**
 * Generates a random string containing numbers and letters.
 * @param length - The desired length of the string.
 * @returns The generated random string.
 */
export const generateRandomString = (length: number): string => {
  let randomString = '';
  const possibleLetters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * possibleLetters.length);
    randomString += possibleLetters[randomIndex];
  }

  return randomString;
};
