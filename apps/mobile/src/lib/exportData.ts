import { Platform, Share } from 'react-native';

/**
 * Hand the user their data. Web: download a JSON file. Native: share sheet.
 * The data never goes anywhere unless the user sends it somewhere.
 */
export async function exportJsonToUser(json: string): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'human-mode-data.json';
    anchor.click();
    URL.revokeObjectURL(url);
    return;
  }
  await Share.share({ message: json });
}
