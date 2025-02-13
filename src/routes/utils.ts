// import routes from '.';
import routes, { IRouteConfig } from './config';
import type { RouteComponentConfig as IRoute } from './index';

/**
 *
 * 将路由转换为一维数组
 * @param routeList 路由
 * @param deep 是否深层转化
 * @param auth 路由是否需要检查授权, 路由配置的auth优先级比这里高
 */

export function flattenRoute(
  routeList: IRouteConfig[],
  deep: boolean,
  auth: boolean,
): IRoute[] {
  const result: IRoute[] = [];

  for (let i = 0; i < routeList.length; i += 1) {
    const route = routeList[i] as any;

    result.push({
      ...route,
      auth: typeof route.auth !== 'undefined' ? route.auth : auth,
    });

    if (route.routes && deep) {
      result.push(...flattenRoute(route.routes, deep, auth));
    }
  }

  return result;
}

function getLayoutRouteList(): IRoute[] {
  return flattenRoute(routes, false, false);
}

function getBusinessRouteList(): IRoute[] {
  const routeList = routes.filter((route: any) => route.path === '/');

  if (routeList.length > 0) {
    return flattenRoute(routeList, true, true);
  }
  return [];
}

function getSystemRouteList(): IRoute[] {
  const routeList = routes.filter((route: any) => route.path === '/system');

  if (routeList.length > 0) {
    return flattenRoute(routeList, true, false);
  }
  return [];
}

/**
 * 遍历路由，初始化映射关系
 * @param routes 路由
 */
const initMap = (routeList: IRouteConfig[]): Record<string, IRouteConfig>[] => {
  const child: Record<string, IRouteConfig>[] = [];
  routeList.forEach((route) => {
    const r = { [route.path]: route };
    child.push(r);
    if (route.routes && route.routes.length > 0) {
      const reslut = initMap(route.routes);
      child.push(...reslut);
    }
  });

  return child;
};

/**
 * 这里会将 config 中所有路由解析成三个数组
 * 第一个: 最外层的路由，例如  Layout UserLayout ...
 * 第二个: 系统路由, 例如 Login Register RegisterResult
 * 第三个: 业务路由，为 / 路由下的业务路由
 * 第四个： 面包屑路由映射
 */

export const layoutRouteList = getLayoutRouteList();

export const businessRouteList = getBusinessRouteList();

export const systemRouteList = getSystemRouteList();

export const breadcrumbRouteMap = initMap(routes);

function findRoutesByPaths(
  pathList: string[],
  routeList: IRoute[],
  basename?: string,
): IRoute[] {
  return routeList.filter(
    (child: IRoute) => pathList.indexOf((basename || '') + child.path) !== -1,
  );
}

export function getCurrentPage(routeList: IRoute[]): IRoute | null {
  const route = routeList.find((child) => child.path === window.location.pathname);

  return route || null;
}

export function getPagePathList(pathname?: string): string[] {
  return (pathname || window.location.pathname)
    .split('/')
    .filter(Boolean)
    .map((value, index, array) => '/'.concat(array.slice(0, index + 1).join('/')));
}

/**
 * 只有业务路由会有面包屑
 */
export function getBreadcrumbs(): IRoute[] {
  return findRoutesByPaths(getPagePathList(), businessRouteList);
}
