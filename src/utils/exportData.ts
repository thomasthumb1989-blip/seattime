import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { DriveSession } from '@src/types';

export async function exportSessionsAsJson(sessions: DriveSession[]): Promise<void> {
  const data = JSON.stringify(sessions, null, 2);
  const filename = `seattime_drives_${Date.now()}.json`;
  const file = new File(Paths.cache, filename);
  file.write(data);

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Export Drive Data',
    UTI: 'public.json',
  });
}
