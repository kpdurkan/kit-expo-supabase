
export function computeCourseHandicap({ hi, slope, courseRating, par }: { hi:number; slope:number; courseRating:number; par:number }) {
  const ch = hi * (slope / 113) + (courseRating - par);
  return Math.round(ch);
}
export function computePlayingHandicap({ hi, slope, courseRating, par, allowance = 1.0 }: { hi:number; slope:number; courseRating:number; par:number; allowance?:number }) {
  const ch = computeCourseHandicap({ hi, slope, courseRating, par });
  return Math.round(ch * allowance);
}
export function stablefordPoints({ par, grossStrokes, shotsReceived }: { par:number; grossStrokes:number; shotsReceived:number }) {
  const net = grossStrokes - shotsReceived;
  const pts = 2 + (par - net);
  return Math.max(0, pts);
}
export function shotsOnHole(playingHcp:number, strokeIndex:number) {
  if (playingHcp <= 0) return 0;
  if (playingHcp >= 18) {
    const full = 1;
    const extra = playingHcp - 18 >= (19 - strokeIndex) ? 1 : 0;
    return full + extra;
  }
  return playingHcp >= (19 - strokeIndex) ? 1 : 0;
}
export const SI_DEFAULT = [1,13,11,7,9,15,3,17,5,2,12,14,6,8,16,10,18,4];
export const PARS_DEFAULT = [4,4,3,4,4,3,5,4,4,4,4,3,5,4,3,4,4,5];
