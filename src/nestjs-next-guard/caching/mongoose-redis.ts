import { Mongoose } from 'mongoose';
import { createClient } from 'redis';

import { ConfigurationNextGuard } from '../nextGuard.config';
import { RedisClientType } from '@redis/client';

export class MongooseRedis {
  client: RedisClientType;
  mongoose: any;
  isConnected = false;
  constructor(configuration?: ConfigurationNextGuard) {
    if (configuration && configuration.redisConfiguration) {
      this.mongoose = configuration.redisConfiguration.mongooseInstance;
      this.client = createClient({
        url: configuration.redisConfiguration.url,
      });
      this.client = createClient({
        url: configuration.redisConfiguration.url,
      });
      this.setupPlugin();
    }
  }

  async clearKey(key) {
    return await this.client.del(key);
  }

  private async setupPlugin(ttl = 60 * 60 * 24) {
    const client = this.client;

    const exec = this.mongoose.Query.prototype.exec;

    (this.mongoose.Query.prototype as any).cache = function (
      options = { time: ttl, key: undefined, cache: false },
    ) {
      this.useCache = options.cache;
      this.time = ttl;
      this.hashKey = JSON.stringify(
        options.key || this.mongooseCollection.name,
      );

      return this;
    };

    await client.hSet('test', 'connection', 'Ok');
    const testQuery = await client.hGet('test', 'connection');
    console.log('Connection Redis', testQuery);
    this.isConnected = true;

    (this.mongoose as Mongoose).Query.prototype.exec = async function () {
      if (!this.useCache) {
        return await exec.apply(this, arguments);
      }

      const key = JSON.stringify({
        ...this.getQuery(),
      });

      // console.time('Query redis');
      const cacheValue = await client.hGet(
        `\"${this.hashKey}\"_NextGuard`,
        key,
      );
      // console.timeEnd('Query redis');

      if (cacheValue) {
        const doc = JSON.parse((cacheValue as any) as string);
        return Array.isArray(doc)
          ? doc.map((d) => new this.model(d))
          : new this.model(doc);
      }
      // console.time('Query mongodb');
      const result = await exec.apply(this, arguments);
      // console.timeEnd('Query mongodb');
      await (client as RedisClientType).hSet(`${this.hashKey}_NextGuard`, key, JSON.stringify(result));
      await (client as RedisClientType).expire(`${this.hashKey}_NextGuard`, this.time);
      return result;
    };
  }
}
