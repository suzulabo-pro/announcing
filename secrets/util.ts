import { spawn } from 'child_process';
import { stderr, stdout } from 'process';

export const sh = (command: string, args?: string[], stdin?: string, echo = true) => {
  return new Promise<string>((resolve, reject) => {
    const p = spawn(command, args, { shell: true });
    if (echo) {
      p.stdout.pipe(stdout);
    }
    p.stderr.pipe(stderr);

    const stdouts: Buffer[] = [];
    p.stdout.on('data', c => {
      stdouts.push(Buffer.from(c));
    });

    p.on('exit', code => {
      if (code == 0) {
        resolve(Buffer.concat(stdouts).toString('utf-8'));
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
