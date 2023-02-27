// @ts-nocheck
// This file is generated by Umi automatically
// DO NOT CHANGE IT MANUALLY!
import './core/polyfill';
import '/Users/zhangsen/Desktop/workcode/laifaxin-web/src/global.less';
import '/Users/zhangsen/Desktop/workcode/laifaxin-web/src/global.tsx';
import { renderClient } from '/Users/zhangsen/Desktop/workcode/laifaxin-web/node_modules/.pnpm/@umijs+renderer-react@4.0.33_ef5jwxihqo6n7gxfmzogljlgcm/node_modules/@umijs/renderer-react';
import { getRoutes } from './core/route';
import { createPluginManager } from './core/plugin';
import { createHistory } from './core/history';
import { ApplyPluginsType } from 'umi';


const publicPath = "/";
const runtimePublicPath = false;

async function render() {
  const pluginManager = createPluginManager();
  const { routes, routeComponents } = await getRoutes(pluginManager);

  // allow user to extend routes
  await pluginManager.applyPlugins({
    key: 'patchRoutes',
    type: ApplyPluginsType.event,
    args: {
      routes,
      routeComponents,
    },
  });

  return (pluginManager.applyPlugins({
    key: 'render',
    type: ApplyPluginsType.compose,
    initialValue() {
      const contextOpts = pluginManager.applyPlugins({
        key: 'modifyContextOpts',
        type: ApplyPluginsType.modify,
        initialValue: {},
      });
      const basename = contextOpts.basename || '/';
      const context = {
        routes,
        routeComponents,
        pluginManager,
        rootElement: contextOpts.rootElement || document.getElementById('root'),
        publicPath,
        runtimePublicPath,
        history: createHistory({
          type: contextOpts.historyType || 'browser',
          basename,
          ...contextOpts.historyOpts,
        }),
        basename,
      };
      const modifiedContext = pluginManager.applyPlugins({
        key: 'modifyClientRenderOpts',
        type: ApplyPluginsType.modify,
        initialValue: context,
      });
      return renderClient(modifiedContext);
    },
  }))();
}

import './plugin-moment2dayjs/runtime.tsx'
render();

window.g_umi = {
  version: '4.0.33',
};
