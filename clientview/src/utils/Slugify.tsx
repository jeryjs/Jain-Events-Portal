/**
 * Converts a string into a URL-friendly slug.
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Removes special characters
 * - Removes consecutive hyphens
 *
 * @param text - The string to convert to a slug
 * @returns A URL-friendly slug string
 */
export default function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with hyphens
        .replace(/&/g, '-and-')      // Replace & with 'and'
        .replace(/[^\w\-]+/g, '')    // Remove all non-word characters except hyphens
        .replace(/\-\-+/g, '-')      // Replace multiple hyphens with single hyphen
        .replace(/^-+/, '')          // Trim hyphens from start
        .replace(/-+$/, '');         // Trim hyphens from end
}