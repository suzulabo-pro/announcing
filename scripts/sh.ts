import { spawn } from 'child_process';
import { stderr, stdout } from 'process';

export const sh = (command: string, options?: { cwd?: string }) => {
  return new Promise<void>((resolve, reject) => {
    const p = spawn(command, { shell: true, cwd: options?.cwd });
    p.stdout.pipe(stdout);
    p.stderr.pipe(stderr);

    p.on('exit', code => {
      if (code == 0) {
        resolve();
      } else {
        reject(new Error(`Error: ${code}`));
      }
    });
  });
};
