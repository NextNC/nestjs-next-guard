import { Module } from '@nestjs/common';
import { NEXT_GUARD_MODELS_TOKEN } from './nextGuard.config';
import { ConfigurationNextGuard } from './configuration';
import { NextGuard } from './guards/roles.guard';
import { CheckModelAccessService } from './services/checkModelAccess.service';

@Module({})
export class NestjsNextGuardModule {
  public static forRoot(config: ConfigurationNextGuard) {
    return {
      module: NestjsNextGuardModule,
      //   controllers: [
      //     ...controllers,
      //   ],
      providers: [
        { provide: NEXT_GUARD_MODELS_TOKEN, useValue: config.models },
        NextGuard,
        CheckModelAccessService,
      ],
      exports: [
        {
          provide: NEXT_GUARD_MODELS_TOKEN,
          useValue: config.models,
        },
        NextGuard,
        CheckModelAccessService,
      ],
    };
  }
}
