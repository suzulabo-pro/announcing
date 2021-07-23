import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { stderr, stdout } from 'process';

const sh = (command: string, args: string[], stdin?: string) => {
  return new Promise<void>((resolve, reject) => {
    const p = spawn(command, args, { shell: true });
    p.stdout.pipe(stdout);
    p.stderr.pipe(stderr);
    p.on('exit', code => {
      if (code == 0) {
        resolve();
      } else {
        reject(new Error(`Error: ${code}`));
      }
    });

    if (stdin) {
      p.stdin.write(stdin, 'utf-8');
      p.stdin.end();
    }
  });
};

export const setSecret = async (name: string, value: string, dryrun?: boolean) => {
  if (!value) {
    throw new Error(`${name} is empty`);
  }
  if (dryrun) {
    console.log(`${name} ...ok`);
    return;
  }

  console.log(`setting ${name} ...`);
  await sh('gh', ['secret', 'set', name], value);
};

export const setSecretFromFile = async (name: string, file: string, dryrun?: boolean) => {
  const value = readFileSync(file, name.endsWith('_BASE64') ? 'base64' : 'utf-8');
  if (!value) {
    throw new Error(`${name} is empty`);
  }
  if (dryrun) {
    console.log(`${name} <- ${file} ...ok`);
    return;
  }

  console.log(`setting ${name} <- ${file} ...`);
  await sh('gh', ['secret', 'set', name], value);
};
