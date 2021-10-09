import * as path from 'path';

export const ROOT_DIR = path.resolve(path.join(__dirname, '../..'));
export const SECRET_DIR = path.join(ROOT_DIR, 'secrets');

export const SECRET_FILES: [string, string][] = [
  ['GoogleService-Info.plist', 'capacitor/client/ios/App/App/GoogleService-Info.plist'],
  ['App.entitlements', 'capacitor/client/ios/App/App/App.entitlements'],
];
