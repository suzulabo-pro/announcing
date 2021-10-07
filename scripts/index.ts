import { sh } from './sh';

const main = async () => {
  await sh('echo hello');
  console.log(process.argv);
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
