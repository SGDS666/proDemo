
/**
 * 
 * *  获取url中的所有参数
 * 
 * *  例子
 * 
 *   当前页面url为:http://127.0.0.1:3000?a=1&b=3&c=3
 * 
 *   调用方式 const {a,b,c} = getUrlData()
 * 
 *   或者 const a = getUrlData().a 
 * 
 */
export const getUrlData = () => {
  let qs = (window.location.search.length > 0 ? window.location.search.substring(1) : "")
  const args: any = {};
  for (let item of qs.split("&").map(kv => kv.split("="))) {
    let name = decodeURIComponent(item[0]),
      value = decodeURIComponent(item[1]);
    if (name) {
      args[name] = value;
    }
  }
  return args;
}