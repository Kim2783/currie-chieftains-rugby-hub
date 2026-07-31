import { describe, it, expect } from 'vitest';
import { getAgeCategoryFromId, getAgeGroupLabel, isClipInPlaylist } from './helpers.js';

describe('Currie Chieftains Helper Utilities', () => {
  
  describe('getAgeCategoryFromId()', () => {
    it('should map primary age groups to minis', () => {
      expect(getAgeCategoryFromId('p1')).toBe('minis');
      expect(getAgeCategoryFromId('p3')).toBe('minis');
      expect(getAgeCategoryFromId('p7')).toBe('minis');
      expect(getAgeCategoryFromId('minis')).toBe('minis');
    });

    it('should map under age groups to youth', () => {
      expect(getAgeCategoryFromId('u13')).toBe('youth');
      expect(getAgeCategoryFromId('u16')).toBe('youth');
      expect(getAgeCategoryFromId('u18')).toBe('youth');
      expect(getAgeCategoryFromId('youth')).toBe('youth');
    });

    it('should map senior age groups to adults', () => {
      expect(getAgeCategoryFromId('adult-1st')).toBe('adults');
      expect(getAgeCategoryFromId('adult-womens')).toBe('adults');
      expect(getAgeCategoryFromId('adult-vets')).toBe('adults');
    });

    it('should default empty values and unmapped groups to youth', () => {
      expect(getAgeCategoryFromId(null)).toBe('youth');
      expect(getAgeCategoryFromId(undefined)).toBe('youth');
      expect(getAgeCategoryFromId('')).toBe('youth');
    });
  });

  describe('getAgeGroupLabel()', () => {
    it('should resolve standard age group names', () => {
      expect(getAgeGroupLabel('p1')).toBe('P1');
      expect(getAgeGroupLabel('p5')).toBe('P5');
      expect(getAgeGroupLabel('u15')).toBe('U15');
      expect(getAgeGroupLabel('adult-1st')).toBe('1st XV');
      expect(getAgeGroupLabel('adult-womens')).toBe("Women's");
    });

    it('should return capitalized group name as fallback if not in SCOTTISH_AGE_GROUPS', () => {
      expect(getAgeGroupLabel('u20')).toBe('U20');
      expect(getAgeGroupLabel('random')).toBe('RANDOM');
    });

    it('should default to ALL when value is empty', () => {
      expect(getAgeGroupLabel(null)).toBe('ALL');
      expect(getAgeGroupLabel(undefined)).toBe('ALL');
    });
  });

  describe('isClipInPlaylist()', () => {
    const dummyClip = (ageGroups, categories = null) => ({
      id: 'test-clip',
      ageGroups: ageGroups,
      ageCategories: categories
    });

    it('should categorize P1-P3 Minis correctly', () => {
      const plId = 'pl-minis-p13';
      expect(isClipInPlaylist(dummyClip(['p1']), plId)).toBe(true);
      expect(isClipInPlaylist(dummyClip(['p2', 'p5']), plId)).toBe(true); // matches P2
      expect(isClipInPlaylist(dummyClip(['p4']), plId)).toBe(false);
      expect(isClipInPlaylist(dummyClip(['u13']), plId)).toBe(false);
    });

    it('should categorize P4-P5 Minis correctly', () => {
      const plId = 'pl-minis-p45';
      expect(isClipInPlaylist(dummyClip(['p4']), plId)).toBe(true);
      expect(isClipInPlaylist(dummyClip(['p5']), plId)).toBe(true);
      expect(isClipInPlaylist(dummyClip(['p3']), plId)).toBe(false);
      expect(isClipInPlaylist(dummyClip(['p6']), plId)).toBe(false);
    });

    it('should categorize P6-P7 Minis correctly', () => {
      const plId = 'pl-minis-p67';
      expect(isClipInPlaylist(dummyClip(['p6']), plId)).toBe(true);
      expect(isClipInPlaylist(dummyClip(['p7']), plId)).toBe(true);
      expect(isClipInPlaylist(dummyClip(['p5']), plId)).toBe(false);
      expect(isClipInPlaylist(dummyClip(['u13']), plId)).toBe(false);
    });

    it('should categorize Youth U13-U18 correctly', () => {
      const plId = 'pl-youth';
      expect(isClipInPlaylist(dummyClip(['u13']), plId)).toBe(true);
      expect(isClipInPlaylist(dummyClip(['u18']), plId)).toBe(true);
      expect(isClipInPlaylist(dummyClip(['p7']), plId)).toBe(false);
      expect(isClipInPlaylist(dummyClip(['adult-1st']), plId)).toBe(false);
    });

    it('should categorize Adult Rugby correctly', () => {
      const plId = 'pl-adults';
      expect(isClipInPlaylist(dummyClip(['adult-1st']), plId)).toBe(true);
      expect(isClipInPlaylist(dummyClip(['adult-vets']), plId)).toBe(true);
      expect(isClipInPlaylist(dummyClip(['u18']), plId)).toBe(false);
    });
  });
});
