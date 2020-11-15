import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { ModuleRef } from '@nestjs/core';
import * as mongoose from 'mongoose'

@Injectable()
export class CheckModelAccessService {
  constructor(private moduleRef: ModuleRef) {}

  public async checkAccess(
    paramValues: any[], // EX: site _id
    modelChain: string[],
    checkValue: any, // user _id  start
    propertyChain: string[] = [], // ['userId']
  ) {
    let paramKey = propertyChain.shift();

    for (const model of modelChain) {
      let instances = await this.dbfind(model, paramValues, '_id');

      if (!instances || instances.length === 0) {
        if (propertyChain.length === 0) {
          return false;
        }
        instances = await await this.dbfind(model, paramValues, paramKey);

        if (!instances || instances.length === 0) {
          return false;
        }
        paramKey = propertyChain.shift();
      } else {
        paramValues = instances.map((instance) => {
          return Types.ObjectId(instance[paramKey]);
        });
        if (!paramValues || paramValues.length === 0) {
          return false;
        }
      }

      if (propertyChain.length > 0) {
        paramKey = propertyChain.shift();
      } else {
        const matches = instances.filter((instance) =>
          Types.ObjectId(checkValue).equals(instance[paramKey]),
        );
        return matches.length > 0;
      }
    }
  }

  dbfind(model: string, paramValues, paramKey) {
    return (this.getModel(model) as any).find({ [paramKey]: { $in: paramValues } }).cache
      ? (this.getModel(model) as any)
          .find({ [paramKey]: { $in: paramValues } })
          .cache({ cache: true })
          .lean()
      : (this.getModel(model) as any)
          .find({ [paramKey]: { $in: paramValues } })
          .lean();
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
