export interface ConfigurationNextGuard {
  // models: string[];
  redisConfiguration?: {
    host: string;
    port: number;
    ttl: number;
    retry_strategy: () => number;
    mongooseInstance: any;
  };
}
