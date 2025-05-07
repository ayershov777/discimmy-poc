// contentUtils.js - Utility functions for module content handling

/**
 * Parses module content from string to segment array
 * @param {string} content The module content string
 * @returns {Array} Array of segment objects or empty array if parsing fails
 */
export const parseModuleContent = (content) => {
    if (!content) return [];

    try {
        // Parse as JSON
        const parsed = JSON.parse(content);

        // Validate it's an array with required properties
        if (Array.isArray(parsed) && parsed.length > 0) {
            const isValid = parsed.every(segment =>
                segment &&
                typeof segment === 'object' &&
                'type' in segment &&
                'title' in segment &&
                'content' in segment
            );

            if (isValid) {
                return parsed;
            }
        }

        // Return empty array if not valid
        return [];
    } catch (e) {
        // Return empty array if parsing fails
        console.error('Error parsing module content:', e);
        return [];
    }
};