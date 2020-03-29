import { Model } from 'mongoose';

export interface ConfigurationNextGuard {
  models: Array<{ model: Model<any>; token: string }>;
}
