import path from 'path';
import pkg from '../package.json';

const isDev = process.env.NODE_ENV === 'development';
const publicPath = isDev ? '/' : '//tinkgu.github.io/xeno/';

export default {
  title: ' ',
  publicPath,
  // favicon: '',
  // logo: '',
  mode: 'site',
  hash: true,
  history: {
    type: 'hash',
  },
  devServer: {
    port: '17122',
  },
  navs: [
    {
      title: 'API 文档',
      path: '/api',
    },
    {
      title: '试一试',
      path: '/try-it',
    },
    {
      title: `v${pkg.version}`,
      path: '',
    },
    {
      title: 'Github',
      path: 'https://github.com/TinkGu/xeno',
    },
  ],
  // 注入 xeno
  chunks: ['xeno', 'umi'],
  chainWebpack(memo) {
    memo.plugins.delete('copy');
    memo.entry('xeno').add(path.join(__dirname, './inject.dist.js')).end();
  },
  // 加快打包和 webpack 配置
  devtool: false,
  nodeModulesTransform: {
    type: 'none',
    exclude: [],
  },
  targets: {
    chrome: 79,
    firefox: false,
    safari: false,
    edge: false,
    ios: false,
  },
  webpack5: {},
};
