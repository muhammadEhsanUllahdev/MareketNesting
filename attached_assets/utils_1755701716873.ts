
// Define the Translations type that was missing
export interface Translations {
  [key: string]: string | Translations;
}

// Helper functions for translations
export const getNestedTranslation = (obj: any, path: string): string => {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return path; // Return the key path if translation not found
    }
  }
  
  return typeof result === 'string' ? result : path;
};
