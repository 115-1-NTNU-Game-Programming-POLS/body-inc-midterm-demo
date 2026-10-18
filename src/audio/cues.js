import { on } from '../core/events.js';
import { sfx } from './sfx.js';

// Which sound plays for which game event. Rules and scenes only emit events.
export function installCues() {
  on('ui:click', () => sfx('click'));
  on('toast', () => sfx('pop'));
  on('say', () => sfx('blip'));
  on('token:pick', () => sfx('pick'));
  on('token:moved', () => sfx('drop'));
  on('token:miss', () => sfx('miss'));
  on('crisis:start', () => sfx('alarm'));
  on('crisis:end', (result) => sfx(result === 'ignore' ? 'bad' : 'good'));
  on('event:start', () => sfx('card'));
  on('night:settled', (n) => sfx(n.score >= 60 ? 'good' : 'bad'));
  on('report:stamp', () => sfx('stamp'));
  on('scene:enter', (name) => { if (name === 'handbook') sfx('unlock'); });
}
