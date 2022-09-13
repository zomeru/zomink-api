// eslint-disable-next-line max-classes-per-file
import {
  getModelForClass,
  modelOptions,
  prop,
  Severity,
  // index,
  Ref,
} from '@typegoose/typegoose';

import { URL } from './url.model';

export const privateFields = ['__v'];

@modelOptions({
  schemaOptions: { _id: false },
})
class Location {
  @prop({ type: String })
  countryName: string;

  @prop({ type: String })
  region: string;

  @prop({ type: String })
  city: string;

  @prop({ type: String })
  countryCode: string;
}

@modelOptions({
  schemaOptions: { _id: false },
})
class Device {
  @prop({ type: String })
  model: string;

  @prop({ type: String })
  type: string;
}

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Click {
  @prop({ ref: () => URL, type: URL })
  url: Ref<URL> | null;

  @prop({ type: String })
  browser: string;

  @prop({ type: String })
  OS: string;

  @prop({ type: Device })
  device: Device;

  @prop({ type: Location })
  location: Location;
}

const ClickModel = getModelForClass(Click);
export default ClickModel;
