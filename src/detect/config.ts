/* eslint-disable no-useless-escape */
import { strMapper } from './utils';

const NAME = 'name';
const VERSION = 'version';

/** windows 版本映射关系 */
const windowsVersionMap = {
  ME: '4.90',
  'NT 3.11': 'NT3.51',
  'NT 4.0': 'NT4.0',
  '2000': 'NT 5.0',
  XP: ['NT 5.1', 'NT 5.2'],
  Vista: 'NT 6.0',
  '7': 'NT 6.1',
  '8': 'NT 6.2',
  '8.1': 'NT 6.3',
  '10': ['NT 6.4', 'NT 10.0'],
  RT: 'ARM',
};

const defaultBrowser = [
  // WeChat Desktop for Windows Built-in Browser
  [/\bqbcore\/([\w\.]+)/i],
  [VERSION, [NAME, 'WeChat(Win) Desktop']],
  // WeChat
  [/micromessenger\/([\w\.]+)/i],
  [VERSION, [NAME, 'WeChat']],
];

const defaultOs = [
  // --- Windows ---
  [
    /microsoft (windows) (vista|xp)/i, // Windows (iTunes)
  ],
  [NAME, VERSION],
  [
    /(windows) nt 6\.2; (arm)/i, // Windows RT
    /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i, // Windows Phone
    /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i,
  ],
  [NAME, [VERSION, strMapper, windowsVersionMap]],
  [/(win(?=3|9|n)|win 9x )([nt\d\.]+)/i],
  [
    [NAME, 'Windows'],
    [VERSION, strMapper, windowsVersionMap],
  ],

  // --- iOS ---
  [
    /ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i, // iOS
    /cfnetwork\/.+darwin/i,
  ],
  [
    [VERSION, /_/g, '.'],
    [NAME, 'iOS'],
  ],
  // --- Mac OS ---
  [
    /(mac os x) ?([\w\. ]*)/i,
    /(macintosh|mac_powerpc\b)(?!.+haiku)/i, // Mac OS
  ],
  [
    [NAME, 'Mac OS'],
    [VERSION, /_/g, '.'],
  ],
  // --- android ---
  [
    // Mobile OSes
    /droid ([\w\.]+)\b.+(android[- ]x86)/i, // Android-x86
  ],
  [VERSION, NAME],
  [
    // Android/WebOS/QNX/Bada/RIM/Maemo/MeeGo/Sailfish OS
    /(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i,
    /(blackberry)\w*\/([\w\.]*)/i, // Blackberry
    /(tizen|kaios)[\/ ]([\w\.]+)/i, // Tizen/KaiOS
    /\((series40);/i, // Series 40
  ],
  [NAME, VERSION],
];

/**
 * 精简后的 ua-parser 的解析配置
 *
 * 具体配置规则是：
 * - 一类内容统一一个数组 rules，简记为 [platform1, config1, platform2, config2]。
 * - 数组的奇数项，存放的是该平台的正则规则， 它的后一项，总是它对应配置规则（即平台名、额外转换规则）
 *
 * */
export const defaultRegMap = {
  os: defaultOs,
  browser: defaultBrowser,
};

/** 系统名字统一化 */
export const osNameMap = {
  android: ['Android'],
  ios: ['iOS'],
  windows: ['Windows'],
  mac: ['Mac'],
};
