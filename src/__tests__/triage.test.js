import { describe, it, expect } from 'vitest';
import { isEmergency, runSimulatedLogic } from '../services/triage.js';

describe('Triage Logic', () => {
  it('identifies emergency keywords', () => {
    expect(isEmergency('I have severe chest pain')).toBe(true);
    expect(isEmergency('My arm is broken')).toBe(false); // not in our severe list
    expect(isEmergency('He is unconscious')).toBe(true);
  });

  it('routes dental queries correctly', () => {
    const result = runSimulatedLogic('I have a toothache');
    expect(result.targetSpecialty).toBe('Dentist');
    expect(result.aiTextResult).toContain('Dentist');
  });

  it('routes cardio queries correctly', () => {
    const result = runSimulatedLogic('irregular heartbeat issue');
    expect(result.targetSpecialty).toBe('Cardiologist');
  });

  it('falls back to General Practitioner', () => {
    const result = runSimulatedLogic('I feel a bit tired today');
    expect(result.targetSpecialty).toBe('General Practitioner');
  });

  it('handles empty or undefined queries gracefully', () => {
    expect(isEmergency('')).toBe(false);
    expect(isEmergency(null)).toBe(false);
    expect(isEmergency(undefined)).toBe(false);
  });

  it('handles crazy casing and spacing', () => {
    expect(isEmergency('   I HAVE sEveRE ChEsT PAin   ')).toBe(true);
    const result = runSimulatedLogic('   DeNtiSt   ');
    expect(result.targetSpecialty).toBe('Dentist');
  });
});
