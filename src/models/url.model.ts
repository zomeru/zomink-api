import {
  getModelForClass,
  modelOptions,
  prop,
  Severity,
  index,
  Ref,
} from '@typegoose/typegoose';

import { User } from './user.model';

export const privateFields = ['__v'];

@index({ alias: 1 })
@index({ updatedAt: 1 })
@index({ user: 1 })
@index({ user: 1, link: 1 })
@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class URL {
  @prop({ required: true, type: String })
  link: string;

  @prop({ ref: () => User, type: User })
  user: Ref<User> | null;

  @prop({ unique: true, type: String })
  alias: string;

  @prop({ type: Boolean })
  isCustomAlias: boolean;

  @prop({ type: Date })
  updatedAt: Date;
}

const URLModel = getModelForClass(URL);
export default URLModel;
