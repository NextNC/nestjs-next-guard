import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class CheckModelAccessService {
  constructor(private moduleRef: ModuleRef) {}

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
          .findOne({ [paramKey]: Types.ObjectId(paramValue) })
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
        return Types.ObjectId(checkValue).equals(instance[paramKey]);
      }
    }
  }
  getModel(key: string) {
    try {
      const model = this.moduleRef.get(getModelToken(key), {
        strict: false,
      });
      if (model) {
        return model;
      } else {
        throw new InternalServerErrorException(
          `Model (${key}) decalaration missing in the NextGuardModule context, please make sure you have this Model provided in the dependency injection pool`,
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Model (${key}) decalaration missing in the NextGuardModule context, please make sure you have this Model provided in the dependency injection pool`,
      );
    }
  }
}
