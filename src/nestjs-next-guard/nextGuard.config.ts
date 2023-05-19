export interface ConfigurationNextGuard {
  // models: string[];
  redisConfiguration?: {
    url: string,
    ttl: number;
    retry_strategy: () => number;
    mongooseInstance: any;
  };
}
