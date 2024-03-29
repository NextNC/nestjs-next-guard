import {
  Injectable,
  CanActivate,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CheckModelAccessService } from '../services/checkModelAccess.service';
import { ICheckOwnerShip } from '../models/check-ownership';
import { Types } from 'mongoose';

@Injectable()
export class NextGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private checkModelAccessService: CheckModelAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let resultOwnerShip = true;
    let roles = this.reflector.get<string[]>('roles', context.getHandler());
    const checkOwnerShip: ICheckOwnerShip = this.reflector.get<ICheckOwnerShip>(
      'checkOwnerShip',
      context.getHandler(),
    );
    if (checkOwnerShip && checkOwnerShip.redisCacheInvalidation) {
      await this.checkModelAccessService.hdelete(
        checkOwnerShip.redisCacheInvalidation.collection
      );
    }
    const request = context.switchToHttp().getRequest();
    const isGod = () => user.roles.includes(checkOwnerShip.godRole);

    if (!roles && !checkOwnerShip) {
      return true;
    }

    if (!roles) {
      roles = [];
    }

    const user = request.user;
    if (!user || !Array.isArray(user.roles)) {
      console.warn(
        'The request must have a user property with an array of roles',
      );
      throw new InternalServerErrorException(
        'The request must have a user property with an array of roles',
      );
    }

    if (checkOwnerShip && isGod()) {
      return true;
    }

    if (checkOwnerShip) {
      const param =
        request.params[checkOwnerShip.requestParam] ||
        request.body[checkOwnerShip.requestParam];

      if (checkOwnerShip && checkOwnerShip.godRole) {
        resultOwnerShip = await this.checkModelAccessService.checkAccess(
          [new Types.ObjectId(param)],
          [...checkOwnerShip.modelChain],
          user._id,
          [...checkOwnerShip.propertyChain],
        );
      }
    }

    const hasRole = () => user.roles.some((role) => roles.includes(role));
    return (
      user && user.roles && (hasRole() || roles.length === 0) && resultOwnerShip
    );
  }
}

// ../../NestJS_Package/nestjs-package-starter/dist
