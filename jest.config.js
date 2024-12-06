/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  // 设置 jest 使用 jsdom 作为测试环境，模拟浏览器环境
  testEnvironment: 'jsdom',

  // 指定如何转译文件，使用 @swc/jest 进行 TypeScript 和 JavaScript 文件的转译
  transform: {
    '^.+\.(ts|tsx|js|jsx)$': '@swc/jest',
  },

  // 配置模块名称的别名映射，方便导入模块时使用简化路径
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/',
  },

  // 指定 .ts 和 .tsx 文件作为 ESM 模块处理
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  // 配置哪些模块需要忽略转译，除了 lodash-es 外其他 node_modules 文件都不转译
  transformIgnorePatterns: ['/node_modules/(?!lodash-es)/'],

  // 设置 jest 在解析模块时，支持的文件扩展名
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // 配置 jest 查找模块的目录，包含 node_modules 和 src 目录
  moduleDirectories: ['node_modules', 'src'],
};

