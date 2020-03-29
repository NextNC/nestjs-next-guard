import {
  Injectable,
  CanActivate,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CheckModelAccessService } from '../services/checkModelAccess.service';
import { ICheckOwnerShip } from '../models/check-ownership';

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
    const request = context.switchToHttp().getRequest();

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

    const param =
      request.params[checkOwnerShip.requestParam] ||
      request.body[checkOwnerShip.requestParam];

    if (
      checkOwnerShip &&
      ((checkOwnerShip as any).godRole &&
        user.roles.indexOf((checkOwnerShip as any).godRole) === -1)
    ) {
      resultOwnerShip = await this.checkModelAccessService.checkAccess(
        param,
        [...checkOwnerShip.modelChain],
        user._id,
        [...checkOwnerShip.propertyChain],
      );
    }

    const hasRole = () => user.roles.some(role => roles.includes(role));
    return (
      user && user.roles && (hasRole() || roles.length === 0) && resultOwnerShip
    );
  }
}
