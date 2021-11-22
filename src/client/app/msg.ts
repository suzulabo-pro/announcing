import { Lang } from '../shared';
import { Msgs } from './msgs/msgs';
import { msgs as jaMsgs } from './msgs/msgs.ja';

const lang: Lang = 'ja';

const msgsMap: { [k: string]: Msgs } = {
  ja: jaMsgs,
};

export class AppMsg {
  get lang() {
    return lang;
  }
  get msgs() {
    return msgsMap[lang] || jaMsgs;
  }
}
