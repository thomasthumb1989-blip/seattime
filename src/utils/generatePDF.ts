import type { DriveSession, OnboardingData } from '@src/types';
import { getStateByAbbreviation } from '@src/data/stateRequirements';

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function generatePDFHtml(sessions: DriveSession[], onboarding: OnboardingData): string {
  const sorted = [...sessions].sort((a, b) => a.startTime - b.startTime);
  const stateData = getStateByAbbreviation(onboarding.state);
  const stateName = stateData?.state ?? onboarding.state;

  const totalSeconds = sorted.reduce((sum, s) => sum + s.durationSeconds, 0);
  const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;
  const daySeconds = sorted
    .filter((s) => s.conditions.timeOfDay === 'day')
    .reduce((sum, s) => sum + s.durationSeconds, 0);
  const dayHours = Math.round((daySeconds / 3600) * 10) / 10;
  const nightSeconds = sorted
    .filter((s) => s.conditions.timeOfDay === 'night')
    .reduce((sum, s) => sum + s.durationSeconds, 0);
  const nightHours = Math.round((nightSeconds / 3600) * 10) / 10;

  const reqTotal = stateData?.totalHours ?? 0;
  const reqNight = stateData?.nightHours ?? 0;
  const totalMet = reqTotal > 0 ? totalHours >= reqTotal : true;
  const nightMet = reqNight > 0 ? nightHours >= reqNight : true;
  const allMet = totalMet && nightMet;

  const dateRange = sorted.length > 0
    ? `${formatDate(sorted[0].startTime)} – ${formatDate(sorted[sorted.length - 1].startTime)}`
    : 'No drives recorded';

  const generatedDate = formatDate(Date.now());

  const tableRows = sorted
    .map((s, i) => {
      const bgColor = i % 2 === 0 ? '#FFFFFF' : '#F8F7F4';
      return `
      <tr style="background-color: ${bgColor};">
        <td>${formatDate(s.startTime)}</td>
        <td>${formatTime(s.startTime)}</td>
        <td>${formatTime(s.endTime)}</td>
        <td>${formatDuration(s.durationSeconds)}</td>
        <td>${capitalize(s.conditions.timeOfDay)}</td>
        <td>${capitalize(s.conditions.weather)}</td>
        <td>${capitalize(s.conditions.roadType)}</td>
        <td>${s.distanceMiles.toFixed(1)} mi</td>
        <td>${s.createdBy ? 'Synced' : 'Local'}</td>
      </tr>`;
    })
    .join('');

  const requirementRow = stateData?.hasRequirement
    ? `<div style="margin-top: 8px; padding: 8px 12px; border-radius: 6px; background-color: ${allMet ? '#E8F5E8' : '#FFF3E0'}; color: ${allMet ? '#2E7D32' : '#E65100'}; font-size: 12px; font-weight: 600;">
        ${allMet ? '✓ State requirement met' : `Progress: ${totalHours}/${reqTotal} total hours, ${nightHours}/${reqNight} night hours`}
      </div>`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { margin: 40px 32px; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1A1A1A; font-size: 11px; line-height: 1.4; }
  .header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #3A7D7E; }
  .header h1 { font-size: 22px; color: #3A7D7E; margin-bottom: 4px; }
  .header .teen-name { font-size: 16px; color: #333; margin-bottom: 2px; }
  .header .meta { font-size: 11px; color: #666; }
  .summary { display: flex; gap: 12px; margin-bottom: 20px; }
  .summary-box { flex: 1; padding: 10px 12px; border: 1px solid #E0DDD5; border-radius: 8px; text-align: center; }
  .summary-box .value { font-size: 20px; font-weight: 700; color: #3A7D7E; }
  .summary-box .label { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { background-color: #3A7D7E; color: #FFFFFF; padding: 6px 8px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
  td { padding: 6px 8px; font-size: 10px; border-bottom: 1px solid #EEECE7; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E0DDD5; }
  .footer .brand { font-size: 10px; color: #999; text-align: center; }
  .footer .disclaimer { font-size: 9px; color: #AAA; text-align: center; margin-top: 4px; }
  .signature { margin-top: 40px; display: flex; gap: 40px; }
  .sig-block { flex: 1; }
  .sig-line { border-top: 1px solid #333; margin-top: 36px; padding-top: 4px; font-size: 10px; color: #666; }
</style>
</head>
<body>
  <div class="header">
    <h1>Supervised Driving Hours Log</h1>
    <div class="teen-name">${onboarding.teenName}</div>
    <div class="meta">${stateName} · ${dateRange} · Generated ${generatedDate}</div>
  </div>

  <div class="summary">
    <div class="summary-box">
      <div class="value">${totalHours}</div>
      <div class="label">Total Hours</div>
    </div>
    <div class="summary-box">
      <div class="value">${dayHours}</div>
      <div class="label">Day Hours</div>
    </div>
    <div class="summary-box">
      <div class="value">${nightHours}</div>
      <div class="label">Night Hours</div>
    </div>
    <div class="summary-box">
      <div class="value">${sorted.length}</div>
      <div class="label">Total Drives</div>
    </div>
  </div>
  ${requirementRow}

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Start</th>
        <th>End</th>
        <th>Duration</th>
        <th>Day/Night</th>
        <th>Weather</th>
        <th>Road</th>
        <th>Distance</th>
        <th>Logged By</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <div class="signature">
    <div class="sig-block">
      <div class="sig-line">Parent/Guardian Signature</div>
    </div>
    <div class="sig-block">
      <div class="sig-line">Date</div>
    </div>
  </div>

  <div class="footer">
    <div class="brand">Generated by SeatTime: Permit Hours Log</div>
    <div class="disclaimer">This document is a record of supervised driving practice hours logged through the SeatTime app. Verify requirements with your state DMV.</div>
  </div>
</body>
</html>`;
}
