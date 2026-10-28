import type {Snapshot} from './rangeMath';

/** Require the snapshot to exist at the decision time, otherwise show it only as an illustration. */
export function snapshotUsableAt(snapshot:Snapshot,asOf:unknown):boolean {
 const time=typeof asOf==='number'?asOf*1000:typeof asOf==='string'?Date.parse(asOf):NaN;
 const end=Date.parse(snapshot.window.end_utc),created=Date.parse(snapshot.generated_at);
 return [time,end,created].every(Number.isFinite)&&Math.max(end,created)<=time;
}
