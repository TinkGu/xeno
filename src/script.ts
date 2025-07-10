/** 在 html body 上添加 script 脚本 */
export function loadScript(url: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      const script = document.createElement('script');
      script.src = url;
      document.body.appendChild(script);
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Script load error: ' + url));
    } catch (err) {
      reject(err);
    }
  });
}
