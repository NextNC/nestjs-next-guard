import {
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { NEXT_GUARD_MODELS_TOKEN } from '../nextGuard.config';

@Injectable()
export class CheckModelAccessService {
  private modelsMap = new Map<string, Model<any>>();
  constructor(
    @Inject(NEXT_GUARD_MODELS_TOKEN)
    private readonly models: Array<{ model: Model<any>; token: string }>,
  ) {
    this.models.forEach(config => {
      this.modelsMap.set(config.token, config.model);
    });
  }

  public async checkAccess(
    paramValue: any, // EX: site _id
    modelChain: string[],
    checkValue: any, // user _id  start
    propertyChain: string[] = [], // ['userId']
  ) {
    let paramKey = propertyChain.shift();

    for (const model of modelChain) {
      let instance = await (this.getModel(model) as any)
        .findById(paramValue)
        .lean();

      if (!instance) {
        if (propertyChain.length === 0) {
          return false;
        }
        instance = await (this.getModel(model) as any)
          .findOne({ [paramKey]: mongoose.Types.ObjectId(paramValue) })
          .lean();

        if (!instance) {
          return false;
        }
        paramKey = propertyChain.shift();
      } else {
        paramValue = instance[paramKey];
        if (!paramValue) {
          return false;
        }
      }

      if (propertyChain.length > 0) {
        paramKey = propertyChain.shift();
      } else {
        return mongoose.Types.ObjectId(checkValue).equals(instance[paramKey]);
      }
    }
  }
  getModel(key: string) {
    const model = this.modelsMap.get(key);
    if (model) {
      return model;
    } else {
      throw new InternalServerErrorException(
        `Model (${key}) decalaration missing in check model access`,
      );
    }
  }
}
