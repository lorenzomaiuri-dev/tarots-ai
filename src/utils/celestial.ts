import { MoonPhase } from '../types/celestial';

export const CelestialService = {
  /**
   * Get current Moon Phase
   */
  getMoonPhase: (date = new Date()): { phase: MoonPhase; icon: string } => {
    const LUNAR_MONTH_MS = 2551442889;

    const REFERENCE_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime();

    const now = date.getTime();

    let phase = ((now - REFERENCE_NEW_MOON) % LUNAR_MONTH_MS) / LUNAR_MONTH_MS;

    if (phase < 0) phase += 1;

    if (phase < 0.02 || phase > 0.98) return { phase: 'New Moon', icon: 'moon-new' };
    if (phase < 0.23) return { phase: 'Waxing Crescent', icon: 'moon-waxing-crescent' };
    if (phase < 0.27) return { phase: 'First Quarter', icon: 'moon-first-quarter' };
    if (phase < 0.48) return { phase: 'Waxing Gibbous', icon: 'moon-waxing-gibbous' };
    if (phase < 0.52) return { phase: 'Full Moon', icon: 'moon-full' };
    if (phase < 0.73) return { phase: 'Waning Gibbous', icon: 'moon-waning-gibbous' };
    if (phase < 0.77) return { phase: 'Last Quarter', icon: 'moon-last-quarter' };

    return { phase: 'Waning Crescent', icon: 'moon-waning-crescent' };
  },
};
