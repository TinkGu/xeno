/**
 * @module
 * @title 特征嗅探
 * @sidemenu true
 */
import { parseBrowser, parseOs } from './ua-parser';

/** ua 信息解析结果 */
export interface UAResult {
  /** ua 字符串 */
  ua: string;
  /** 系统 */
  os: {
    /** 系统名称，统一小写，空表示未知 */
    name: 'ios' | 'android' | 'windows' | 'mac' | '';
    /** 系统版本，特指 ios 或 android 的系统版本，不存在时返回 */
    version: string;
  };
  /** 是否移动端，包括 ios 和 android */
  isMobile: boolean;
  /** 是否 pc，包括 windows 和 mac */
  isPC: boolean;
  /** 是否微信网页 */
  isWx: boolean;
  /** 是否微信小程序内 webview */
  isWxMiniApp: boolean;
  /** 微信版本 */
  wxVersion?: string;
}

const mobileReg = /(phone|pad|iPad|pod|iPhone|iPod|ios|Android|Mobile|IEMobile)/i;
const wxminiAppReg = /miniprogram/i;

/** 是否是移动端平台 */
export const detectMobile = (ua: string) => {
  if (!ua) return false;
  return !!ua.match(mobileReg);
};

/** 是否是 PC 端平台，简单识别非 android 和 ios 系统就是桌面端 */
export const detectPC = (ua: string) => {
  if (!ua) return false;
  return !detectMobile(ua);
};

/**
 * 根据 UA 或特征，探测当前 HOST 所属平台、系统、版本号等。
 * 不传入 UA 参数时，默认使用 `window.navigator.userAgent`。
 *
 * 默认探测的平台及信息：
 * - web 基础信息，包括系统、移动/桌面端、系统版本
 * - 微信环境，包括微信 H5、微信小程序 webview
 *
 * ---
 *
 * 为体积和性能考虑，考虑到一般业务场景，仅需简单的平台判断，所以本函数并不精细，够用即可。
 *
 * 如果你需要进一步获取详细信息，如具体的设备名称、浏览器版本、浏览引擎参数等，建议使用 [ua-parser-js](https://github.com/faisalman/ua-parser-js)
 *
 */
export function detect(ua?: string): UAResult | null {
  try {
    ua = ua || navigator?.userAgent?.toLowerCase();
    if (!ua) {
      return null;
    }

    const os = parseOs(ua) as UAResult['os'];
    const browser = parseBrowser(ua);
    const isMobile = detectMobile(ua);
    const isWx = browser.name === 'WeChat';
    // 小程序 webview 特征说明：https://developers.weixin.qq.com/miniprogram/dev/component/web-view.html
    const isWxMiniApp = isWx && (!!ua.match(wxminiAppReg) || window?.__wxjs_environment === 'miniprogram');

    return {
      ua,
      os,
      isMobile,
      isPC: !isMobile,
      // -- 微信相关处理 --
      isWx,
      isWxMiniApp,
      wxVersion: isWx ? browser.version : undefined,
    };
  } catch (err) {
    return null;
  }
}
