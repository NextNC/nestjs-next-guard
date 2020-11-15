import { Module } from '@nestjs/common';
import { NEXT_GUARD_MODELS_TOKEN } from './nextGuard.config';
import { ConfigurationNextGuard } from './configuration';
import { NextGuard } from './guards/roles.guard';
import { CheckModelAccessService } from './services/checkModelAccess.service';
import { MongooseRedis } from './caching/mongoose-redis';

@Module({})
export class NextGuardModule {
  public static forRoot(configuration?: ConfigurationNextGuard) {
    const redisPlugin = new MongooseRedis(configuration);
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
