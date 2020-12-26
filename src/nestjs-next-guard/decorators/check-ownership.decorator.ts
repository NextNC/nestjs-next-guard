import { SetMetadata } from '@nestjs/common';
import { ICheckOwnerShip } from '../models/check-ownership';

export const CheckOwnerShip = (config: ICheckOwnerShip) => {
  return SetMetadata('checkOwnerShip', {
    propertyChain: config.propertyChain,
    requestParam: config.requestParam,
    modelChain: config.modelChain,
    godRole: config.godRole,
    redisCacheInvalidation: config.redisCacheInvalidation,
  });
};
