import { sh } from './sh';

export type ScriptFunction = (args?: string[]) => Promise<unknown> | void;
export type Command = { cmd: string; cwd?: string };

export type Script = ScriptFunction | Command | string;

export class ParallelRun {
  constructor(public readonly scripts: Script[]) {}
}
export class SequentialRun {
  constructor(public readonly scripts: Script[]) {}
}

export type ScriptEntries = [string, Script | ParallelRun | SequentialRun][];

const execScript = async (script: Script, args?: string[]) => {
  if (typeof script == 'function') {
    console.info(`> ${script.name}`);
    console.info();
    await script(args);
    return;
  }

  const command = typeof script == 'string' ? { cmd: script } : script;
  console.info(`> ${command.cmd}`);
  console.info();
  await sh(command.cmd, args, { cwd: command.cwd });
};

export const runScript = async (entries: ScriptEntries, name: string, args: string[]) => {
  const scriptMap = new Map(entries);

  const run = async (k: string | Script) => {
    if (typeof k != 'string') {
      await execScript(k, args);
    } else {
      const s = scriptMap.get(k);
      if (!s) {
        throw `invalid name: ${k}`;
      }

      console.info(`> ${k}`);

      if (s instanceof ParallelRun) {
        console.info();

        await Promise.all(
          s.scripts.map(v => {
            return run(v);
          }),
        );
        return;
      }
      if (s instanceof SequentialRun) {
        console.info();

        for (const v of s.scripts) {
          await run(v);
        }
        return;
      }

      await execScript(s, args);
    }
  };

  await run(name);
};
