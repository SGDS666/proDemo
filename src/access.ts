/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { pageAuth?: any } | undefined) {
  const { pageAuth } = initialState ?? {};
  if (pageAuth) {
    return pageAuth;
  }
  return {};
  // return {
  //   canAdmin: currentUser && currentUser.access === 'admin',
  // };
}
