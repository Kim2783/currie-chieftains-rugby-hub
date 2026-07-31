import { SCOTTISH_AGE_GROUPS } from '../data/initialData.js';

export function getAgeCategoryFromId(ageId) {
  if (!ageId) return 'youth';
  if (ageId.startsWith('p') || ageId === 'minis') return 'minis';
  if (ageId.startsWith('u') || ageId === 'youth') return 'youth';
  if (ageId.includes('adult') || ageId.includes('senior')) return 'adults';
  return 'youth';
}

export function getAgeGroupLabel(ageId) {
  const ag = SCOTTISH_AGE_GROUPS.find(a => a.id === ageId);
  return ag ? ag.name : (ageId ? ageId.toUpperCase() : 'ALL');
}

export function isClipInPlaylist(clip, playlistId) {
  if (!clip) return false;
  const clipAges = clip.ageGroups || (clip.ageGroup ? [clip.ageGroup] : ['u14']);
  const clipCats = clip.ageCategories || [getAgeCategoryFromId(clipAges[0])];

  if (playlistId === 'pl-minis-p13') {
    return clipAges.some(a => a === 'p1' || a === 'p2' || a === 'p3');
  }
  if (playlistId === 'pl-minis-p45') {
    return clipAges.some(a => a === 'p4' || a === 'p5');
  }
  if (playlistId === 'pl-minis-p67') {
    return clipAges.some(a => a === 'p6' || a === 'p7');
  }
  if (playlistId === 'pl-youth') {
    return clipCats.includes('youth') || clipAges.some(a => getAgeCategoryFromId(a) === 'youth');
  }
  if (playlistId === 'pl-adults') {
    return clipCats.includes('adults') || clipAges.some(a => getAgeCategoryFromId(a) === 'adults');
  }
  return false;
}
