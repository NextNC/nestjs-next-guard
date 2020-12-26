import { Mongoose } from 'mongoose';
import * as redis from 'redis';
import * as util from 'util';
import { ConfigurationNextGuard } from '../nextGuard.config';

export class MongooseRedis {
  client: any;
  mongoose: any;
  isConnected = false;
  constructor(configuration?: ConfigurationNextGuard) {
    if (configuration && configuration.redisConfiguration) {
      this.mongoose = configuration.redisConfiguration.mongooseInstance;
      this.client = redis.createClient({
        host: configuration.redisConfiguration.host,
        port: configuration.redisConfiguration.port,
        retry_strategy: configuration.redisConfiguration.retry_strategy,
      });
      this.setupPlugin();
    }
  }

  async clearKey(key) {
    return await this.client.del(key);
  }

  private async setupPlugin(ttl = 60 * 60 * 24) {
    const client: redis.RedisClient = this.client;

    client.hget = util.promisify(this.client.hget);
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

    await client.hset('test', 'connection', 'Ok');
    const testQuery = await client.hget('test', 'connection');
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
      const cacheValue = await client.hget(
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
      client.hset(`${this.hashKey}_NextGuard`, key, JSON.stringify(result));
      (client as redis.RedisClient).expire(
        `${this.hashKey}_NextGuard`,
        this.time,
      );
      return result;
    };
  }
}
