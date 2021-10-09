import { spawn } from 'child_process';
import { stderr, stdout } from 'process';

const procs = new Set<ReturnType<typeof spawn>>();

let terminated = false;

export const sh = (command: string, args?: string[], options?: { cwd?: string }) => {
  return new Promise<void>((resolve, reject) => {
    const p = spawn(command, args, { shell: true, cwd: options?.cwd });
    p.stdout.pipe(stdout);
    p.stderr.pipe(stderr);

    procs.add(p);

    p.on('exit', code => {
      if (code == 0) {
        resolve();
      } else {
        reject(new Error(`Error: ${code}`));
      }
      procs.delete(p);
      if (terminated && procs.size == 0) {
        process.exit(0);
      }
    });
  });
};

process.on('SIGINT', () => {
  terminated = true;
  if (procs.size == 0) {
    process.exit(0);
  }
  procs.forEach(p => {
    p.kill('SIGTERM');
  });
});
