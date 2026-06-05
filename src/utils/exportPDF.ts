import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { DriveSession, OnboardingData } from '@src/types';
import { generatePDFHtml } from './generatePDF';

export async function exportPDF(sessions: DriveSession[], onboarding: OnboardingData): Promise<void> {
  const html = generatePDFHtml(sessions, onboarding);
  const { uri } = await Print.printToFileAsync({ html });

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Export Driving Log PDF',
    UTI: 'com.adobe.pdf',
  });
}
