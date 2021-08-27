import * as admin from 'firebase-admin';
import { Request, Response } from 'firebase-functions';

export const httpsPingImportPosts = async (
  req: Request,
  res: Response,
  adminApp: admin.app.App,
) => {
  //
  console.log(req, res, adminApp);
  return Promise.resolve();
};
