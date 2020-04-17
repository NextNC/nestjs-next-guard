import { Module } from '@nestjs/common';
import { NEXT_GUARD_MODELS_TOKEN } from './nextGuard.config';
import { ConfigurationNextGuard } from './configuration';
import { NextGuard } from './guards/roles.guard';
import { CheckModelAccessService } from './services/checkModelAccess.service';

@Module({})
export class NextGuardModule {
  public static forRoot() {
    return {
      module: NextGuardModule,
      //   controllers: [
      //     ...controllers,
      //   ],
      providers: [NextGuard, CheckModelAccessService],
      exports: [NextGuard, CheckModelAccessService],
    };
  }
}
