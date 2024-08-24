export class UseVisibilityChange {

  current: boolean = true

  install() {
    if (typeof window === 'undefined' || typeof window.document === 'undefined') return
    const document = window.document as any
    let hidden, visibilityChange;
    if (typeof document.hidden !== "undefined") {
      hidden = "hidden";
      visibilityChange = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined") {
      hidden = "mozHidden";
      visibilityChange = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      hidden = "msHidden";
      visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      hidden = "webkitHidden";
      visibilityChange = "webkitvisibilitychange";
    }
    window.addEventListener(visibilityChange, () => {
      if (document[hidden]) {
        // 用户没有浏览当前页面
        this.current = false
      } else {
        // 用户正在浏览当前页面
        this.current = true
      }
    });
  }
}

export const useVisibilityChange = new UseVisibilityChange();
