import {
  getModelForClass,
  modelOptions,
  prop,
  Severity,
  pre,
  DocumentType,
  index,
} from '@typegoose/typegoose';
import { nanoid } from 'nanoid';
import argon2 from 'argon2';

import log from '../utils/logger';

export const privateFields = [
  'password',
  '__v',
  'verificationCode',
  'passwordResetCode',
  'verified',
  'tokenVersion',
];

// eslint-disable-next-line no-use-before-define
@pre<User>('save', async function () {
  if (!this.isModified('password')) return;

  const hash = await argon2.hash(this.password);

  this.password = hash;
})
@index({ email: 1 })
@index({ email: 1, username: 1 })
@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class User {
  @prop({ lowercase: true, required: true, unique: true, type: String })
  username: string;

  @prop({ lowercase: true, required: true, unique: true, type: String })
  email: string;

  @prop({ required: true, type: String })
  firstName: string;

  @prop({ required: true, type: String })
  lastName: string;

  @prop({ required: true, type: String })
  password: string;

  @prop({ required: true, default: (): string => nanoid(), type: String })
  tokenVersion: string;

  @prop({ required: false, default: 'none', type: String })
  authProvider: string;

  @prop({ required: false, default: null, type: String })
  authProviderId: string | null;

  @prop({ required: false, default: false, type: Boolean })
  verified: boolean;

  @prop({ required: true, default: (): string => nanoid(), type: String })
  verificationCode: string | null;

  @prop({ type: String })
  passwordResetCode: string | null;

  async validatePassword(this: DocumentType<User>, candidate: string) {
    try {
      log.debug(`Validating password for user ${this.username}`);
      return await argon2.verify(this.password, candidate);
    } catch (error) {
      log.error(error, 'Could not validate password.');
      return false;
    }
  }
}

const UserModel = getModelForClass(User);

export default UserModel;
