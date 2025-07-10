type BuildType = 'prod' | 'uat' | 'test' | 'dev';

interface EnvConfig<T> {
  prod: T;
  uat?: T;
  test: T;
  dev?: T;
}

/** 当前环境下，对应各项的配置 */
type ConfigMap<T extends Record<string, EnvConfig<any>>> = {
  [P in keyof T]: T[P] extends EnvConfig<infer U> ? U : never;
};

/**
 * 根据当前环境，获得具体配置
 * ```javascript
 * const envMap = getConfigByEnv({
 *   appid: {
 *     dev: '101',
 *     test: '101',
 *     uat: '301',
 *     prod: '104'
 *   }
 * })
 * // 若在测服环境下
 * envMap.a // '101'
 * ```
 */
export function getConfigByEnv<T extends Record<string, EnvConfig<any>>>(linkMap: T) {
  const configs = {} as ConfigMap<typeof linkMap>;
  Object.keys(linkMap).forEach((key: keyof typeof linkMap) => {
    configs[key] = getValueByEnv(linkMap[key]);
  });

  return configs;
}

/**
 * 根据当前环境，获得具体值
 *
 * ```javascript
 * const a = getValueByEnv({
 *   dev: 1,
 *   test: 2,
 *   uat: 3,
 *   prod: 4
 * })
 * // 若在测服环境下
 * a // 2
 * ```
 * */
export function getValueByEnv<T>(config: EnvConfig<T>) {
  let type = process.env.BUILD_TYPE as BuildType;
  if (!['prod', 'uat', 'test', 'dev'].includes(type)) {
    type = 'test';
  }

  if (!config.dev && type === 'dev') {
    return config.test;
  }

  return config[type] as T;
}
