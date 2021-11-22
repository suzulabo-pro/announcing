import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {
  CreateAnnounceParams,
  DeleteAnnounceParams,
  DeleteExternalAnnouncesParams,
  DeletePostParams,
  EditAnnounceParams,
  PutExternalAnnouncesParams,
  PutPostParams,
  RegisterNotificationParams,
} from '../../shared';
import { logger } from '../utils/logger';
import { CreateAnnounceParamsSchema } from './create-announce-params';
import { DeleteAnnounceParamsSchema } from './delete-announce-params';
import { DeletePostParamsSchema } from './delete-post-params';
import { EditAnnounceParamsSchema } from './edit-announce-params';
import { ExternalAnnounceJSON, ExternalAnnounceJSONSchema } from './external-announce-json';
import {
  DeleteExternalAnnouncesParamsSchema,
  PutExternalAnnouncesParamsSchema,
} from './external-announces-params';
import { PutPostParamsSchema } from './put-post-params';
import { RegisterNotificationParamsSchema } from './register-notification-params';

const ajv = new Ajv();
addFormats(ajv);

ajv.addSchema(CreateAnnounceParamsSchema, 'CreateAnnounceParams');
ajv.addSchema(DeleteAnnounceParamsSchema, 'DeleteAnnounceParams');
ajv.addSchema(DeletePostParamsSchema, 'DeletePostParams');
ajv.addSchema(EditAnnounceParamsSchema, 'EditAnnounceParams');
ajv.addSchema(PutPostParamsSchema, 'PutPostParams');
ajv.addSchema(RegisterNotificationParamsSchema, 'RegisterNotificationParams');
ajv.addSchema(PutExternalAnnouncesParamsSchema, 'PutExternalAnnouncesParams');
ajv.addSchema(DeleteExternalAnnouncesParamsSchema, 'DeleteExternalAnnouncesParams');

ajv.addSchema(ExternalAnnounceJSONSchema, 'ExternalAnnounceJSON');

const genValidator = <T>(k: string) => {
  const validator = (data: any): data is T => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const v = ajv.getSchema<T>(k)!;
    if (v(data)) {
      return true;
    }
    logger.error('validate error', { k, data, errors: v.errors });
    return false;
  };
  return validator;
};

export const validators = {
  createAnnounceParams: genValidator<CreateAnnounceParams>('CreateAnnounceParams'),
  deleteAnnounceParams: genValidator<DeleteAnnounceParams>('DeleteAnnounceParams'),
  deletePostParams: genValidator<DeletePostParams>('DeletePostParams'),
  editAnnounceParams: genValidator<EditAnnounceParams>('EditAnnounceParams'),
  putPostParams: genValidator<PutPostParams>('PutPostParams'),
  registerNotificationParams: genValidator<RegisterNotificationParams>(
    'RegisterNotificationParams',
  ),
  putExternalAnnouncesParams: genValidator<PutExternalAnnouncesParams>(
    'PutExternalAnnouncesParams',
  ),
  deleteExternalAnnouncesParams: genValidator<DeleteExternalAnnouncesParams>(
    'DeleteExternalAnnouncesParams',
  ),

  externalAnnounceJSON: genValidator<ExternalAnnounceJSON>('ExternalAnnounceJSON'),
};

export const __schemas = ajv.schemas;
