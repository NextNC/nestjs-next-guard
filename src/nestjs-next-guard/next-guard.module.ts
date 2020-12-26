import { Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { MongooseRedis } from './caching/mongoose-redis';
import { NextGuard } from './guards/roles.guard';
import { ConfigurationNextGuard } from './nextGuard.config';
import { CheckModelAccessService } from './services/checkModelAccess.service';
import { NEXT_GUARD_CONFIGURATION } from './tokens/tokens';

@Module({})
export class NextGuardModule {
  public static forRoot(configuration?: ConfigurationNextGuard) {
    const redisPlugin = new MongooseRedis(configuration);
    return {
      module: NextGuardModule,
      //   controllers: [
      //     ...controllers,
      //   ],
      providers: [
        { provide: NEXT_GUARD_CONFIGURATION, useValue: configuration },
        // ,
        NextGuard,
        {
          provide: CheckModelAccessService,
          deps: [NEXT_GUARD_CONFIGURATION, ModuleRef],
          useFactory: (moduleRef: ModuleRef) =>
            new CheckModelAccessService(moduleRef, configuration),
        },
      ],
      exports: [NextGuard, CheckModelAccessService],
    };
  }
}
