import { BaseError, stripObj } from '../../shared';
import { CallableContext, FirebaseAdminApp } from '../firebase';
import { validators } from '../json-schema';
import { createAnnounce } from './create-announce';
import { deleteAnnounce } from './delete-announce';
import { deletePost } from './delete-post';
import { editAnnounce } from './edit-announce';
import { editImportPosts } from './edit-import-posts';
import { putPost } from './put-post';
import { registerNotification } from './register-notification';

class InvalidParamsError extends BaseError {
  constructor(public data: any) {
    super();
  }
}

class HttpsCallError extends BaseError {
  constructor(public error: any, public data: any) {
    super();
  }
}

export const httpsCallHandler = async (
  data: any,
  context: CallableContext,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  stripObj(data);

  const method = data.method;

  try {
    switch (method) {
      case 'CreateAnnounce':
        if (validators.createAnnounceParams(data)) {
          return createAnnounce(data, context, adminApp);
        }
        break;
      case 'DeleteAnnounce':
        if (validators.deleteAnnounceParams(data)) {
          return deleteAnnounce(data, context, adminApp);
        }
        break;
      case 'DeletePost':
        if (validators.deletePostParams(data)) {
          return deletePost(data, context, adminApp);
        }
        break;
      case 'EditAnnounce':
        if (validators.editAnnounceParams(data)) {
          return editAnnounce(data, context, adminApp);
        }
        break;
      case 'EditImportPosts':
        if (validators.editImportPostsParams(data)) {
          return editImportPosts(data, context, adminApp);
        }
        break;
      case 'PutPost':
        if (validators.putPostParams(data)) {
          return putPost(data, context, adminApp);
        }
        break;
      case 'RegisterNotification':
        if (validators.registerNotificationParams(data)) {
          return registerNotification(data, context, adminApp);
        }
        break;
    }
  } catch (err) {
    throw new HttpsCallError(err, data);
  }

  throw new InvalidParamsError({ data });
};

export const __InvalidParamsError = InvalidParamsError;