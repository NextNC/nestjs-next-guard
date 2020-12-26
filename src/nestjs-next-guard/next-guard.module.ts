import { Module } from '@nestjs/common';
import { MongooseRedis } from './caching/mongoose-redis';
import { NextGuard } from './guards/roles.guard';
import { ConfigurationNextGuard } from './nextGuard.config';
import { CheckModelAccessService } from './services/checkModelAccess.service';
import { NEXT_GUARD_CONFIGURATION, REDIS_CLIENT } from './tokens/tokens';

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
        { provide: REDIS_CLIENT, useValue: redisPlugin },
        // ,
        CheckModelAccessService,
        NextGuard,
      ],
      exports: [ CheckModelAccessService, NextGuard],
    };
  }
}
