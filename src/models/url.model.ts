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
}

const URLModel = getModelForClass(URL);
export default URLModel;
