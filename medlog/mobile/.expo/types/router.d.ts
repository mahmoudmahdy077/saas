/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/export */
/* eslint-disable @typescript-eslint/ban-types */
declare module "expo-router" {
  import type { LinkProps as OriginalLinkProps } from 'expo-router/build/link/Link';
  import type { Router as OriginalRouter } from 'expo-router/build/types';
  export * from 'expo-router/build';

  // prettier-ignore
  type StaticRoutes = `/` | `/(auth)/forgot-password/` | `/forgot-password/` | `/(auth)/forgot-password` | `/(auth)/login/` | `/login/` | `/(auth)/login` | `/(auth)/register/` | `/register/` | `/(auth)/register` | `/(consultant)/dashboard/` | `/dashboard/` | `/(consultant)/dashboard` | `/(consultant)/settings/` | `/settings/` | `/(consultant)/settings` | `/(consultant)/verified-cases/` | `/verified-cases/` | `/(consultant)/verified-cases` | `/(consultant)/verify-cases/` | `/verify-cases/` | `/(consultant)/verify-cases` | `/(institution_admin)/billing/` | `/billing/` | `/(institution_admin)/billing` | `/(institution_admin)/branding/` | `/branding/` | `/(institution_admin)/branding` | `/(institution_admin)/dashboard/` | `/(institution_admin)/dashboard` | `/(institution_admin)/integrations/` | `/integrations/` | `/(institution_admin)/integrations` | `/(institution_admin)/roles/` | `/roles/` | `/(institution_admin)/roles` | `/(institution_admin)/scheduled-reports/` | `/scheduled-reports/` | `/(institution_admin)/scheduled-reports` | `/(institution_admin)/settings/` | `/(institution_admin)/settings` | `/(institution_admin)/sso/` | `/sso/` | `/(institution_admin)/sso` | `/(institution_admin)/templates/` | `/templates/` | `/(institution_admin)/templates` | `/(institution_admin)/users/` | `/users/` | `/(institution_admin)/users` | `/(main)/cases/` | `/cases/` | `/(main)/cases` | `/(main)/cases/new/` | `/cases/new/` | `/(main)/cases/new` | `/(main)/dashboard/` | `/(main)/dashboard` | `/(main)/portfolio/` | `/portfolio/` | `/(main)/portfolio` | `/(main)/progress/` | `/progress/` | `/(main)/progress` | `/(main)/references/` | `/references/` | `/(main)/references` | `/(main)/reports/` | `/reports/` | `/(main)/reports` | `/(main)/settings/` | `/(main)/settings` | `/(program_director)/dashboard/` | `/(program_director)/dashboard` | `/(program_director)/milestones/` | `/milestones/` | `/(program_director)/milestones` | `/(program_director)/reports/` | `/(program_director)/reports` | `/(program_director)/residents/` | `/residents/` | `/(program_director)/residents` | `/(super_admin)/ai-providers/` | `/ai-providers/` | `/(super_admin)/ai-providers` | `/(super_admin)/api-keys/` | `/api-keys/` | `/(super_admin)/api-keys` | `/(super_admin)/audit-logs/` | `/audit-logs/` | `/(super_admin)/audit-logs` | `/(super_admin)/compliance/` | `/compliance/` | `/(super_admin)/compliance` | `/(super_admin)/dashboard/` | `/(super_admin)/dashboard` | `/(super_admin)/feature-flags/` | `/feature-flags/` | `/(super_admin)/feature-flags` | `/(super_admin)/institutions/` | `/institutions/` | `/(super_admin)/institutions` | `/(super_admin)/notifications/` | `/notifications/` | `/(super_admin)/notifications` | `/(super_admin)/plans/` | `/plans/` | `/(super_admin)/plans` | `/(super_admin)/settings/` | `/(super_admin)/settings` | `/(super_admin)/system-settings/` | `/system-settings/` | `/(super_admin)/system-settings` | `/(super_admin)/webhooks/` | `/webhooks/` | `/(super_admin)/webhooks`;
  // prettier-ignore
  type DynamicRoutes<T extends string> = `/(consultant)/case-review/${SingleRoutePart<T>}/` | `/case-review/${SingleRoutePart<T>}/` | `/(consultant)/case-review/${SingleRoutePart<T>}` | `/(main)/cases/${SingleRoutePart<T>}/` | `/cases/${SingleRoutePart<T>}/` | `/(main)/cases/${SingleRoutePart<T>}` | `/(program_director)/resident-cases/${SingleRoutePart<T>}/` | `/resident-cases/${SingleRoutePart<T>}/` | `/(program_director)/resident-cases/${SingleRoutePart<T>}` | `/(program_director)/resident-detail/${SingleRoutePart<T>}/` | `/resident-detail/${SingleRoutePart<T>}/` | `/(program_director)/resident-detail/${SingleRoutePart<T>}` | `/(super_admin)/institution-detail/${SingleRoutePart<T>}/` | `/institution-detail/${SingleRoutePart<T>}/` | `/(super_admin)/institution-detail/${SingleRoutePart<T>}`;
  // prettier-ignore
  type DynamicRouteTemplate = `/(consultant)/case-review/[id]/` | `/(main)/cases/[id]/` | `/(program_director)/resident-cases/[id]/` | `/(program_director)/resident-detail/[id]/` | `/(super_admin)/institution-detail/[id]/`;

  type RelativePathString = `./${string}` | `../${string}` | '..';
  type AbsoluteRoute = DynamicRouteTemplate | StaticRoutes;
  type ExternalPathString = `${string}:${string}`;

  type ExpoRouterRoutes = DynamicRouteTemplate | StaticRoutes | RelativePathString;
  export type AllRoutes = ExpoRouterRoutes | ExternalPathString;

  /****************
   * Route Utils  *
   ****************/

  type SearchOrHash = `?${string}` | `#${string}`;
  type UnknownInputParams = Record<string, string | number | (string | number)[]>;
  type UnknownOutputParams = Record<string, string | string[]>;

  /**
   * Return only the RoutePart of a string. If the string has multiple parts return never
   *
   * string   | type
   * ---------|------
   * 123      | 123
   * /123/abc | never
   * 123?abc  | never
   * ./123    | never
   * /123     | never
   * 123/../  | never
   */
  type SingleRoutePart<S extends string> = S extends `${string}/${string}`
    ? never
    : S extends `${string}${SearchOrHash}`
    ? never
    : S extends ''
    ? never
    : S extends `(${string})`
    ? never
    : S extends `[${string}]`
    ? never
    : S;

  /**
   * Return only the CatchAll router part. If the string has search parameters or a hash return never
   */
  type CatchAllRoutePart<S extends string> = S extends `${string}${SearchOrHash}`
    ? never
    : S extends ''
    ? never
    : S extends `${string}(${string})${string}`
    ? never
    : S extends `${string}[${string}]${string}`
    ? never
    : S;

  // type OptionalCatchAllRoutePart<S extends string> = S extends `${string}${SearchOrHash}` ? never : S

  /**
   * Return the name of a route parameter
   * '[test]'    -> 'test'
   * 'test'      -> never
   * '[...test]' -> '...test'
   */
  type IsParameter<Part> = Part extends `[${infer ParamName}]` ? ParamName : never;

  /**
   * Return a union of all parameter names. If there are no names return never
   *
   * /[test]         -> 'test'
   * /[abc]/[...def] -> 'abc'|'...def'
   */
  type ParameterNames<Path> = Path extends `${infer PartA}/${infer PartB}`
    ? IsParameter<PartA> | ParameterNames<PartB>
    : IsParameter<Path>;

  /**
   * Returns all segements of a route.
   *
   * /(group)/123/abc/[id]/[...rest] -> ['(group)', '123', 'abc', '[id]', '[...rest]'
   */
  type RouteSegments<Path> = Path extends `${infer PartA}/${infer PartB}`
    ? PartA extends '' | '.'
      ? [...RouteSegments<PartB>]
      : [PartA, ...RouteSegments<PartB>]
    : Path extends ''
    ? []
    : [Path];

  /**
   * Returns a Record of the routes parameters as strings and CatchAll parameters
   *
   * There are two versions, input and output, as you can input 'string | number' but
   *  the output will always be 'string'
   *
   * /[id]/[...rest] -> { id: string, rest: string[] }
   * /no-params      -> {}
   */
  type InputRouteParams<Path> = {
    [Key in ParameterNames<Path> as Key extends `...${infer Name}`
      ? Name
      : Key]: Key extends `...${string}` ? (string | number)[] : string | number;
  } & UnknownInputParams;

  type OutputRouteParams<Path> = {
    [Key in ParameterNames<Path> as Key extends `...${infer Name}`
      ? Name
      : Key]: Key extends `...${string}` ? string[] : string;
  } & UnknownOutputParams;

  /**
   * Returns the search parameters for a route.
   */
  export type SearchParams<T extends AllRoutes> = T extends DynamicRouteTemplate
    ? OutputRouteParams<T>
    : T extends StaticRoutes
    ? never
    : UnknownOutputParams;

  /**
   * Route is mostly used as part of Href to ensure that a valid route is provided
   *
   * Given a dynamic route, this will return never. This is helpful for conditional logic
   *
   * /test         -> /test, /test2, etc
   * /test/[abc]   -> never
   * /test/resolve -> /test, /test2, etc
   *
   * Note that if we provide a value for [abc] then the route is allowed
   *
   * This is named Route to prevent confusion, as users they will often see it in tooltips
   */
  export type Route<T> = T extends string
    ? T extends DynamicRouteTemplate
      ? never
      :
          | StaticRoutes
          | RelativePathString
          | ExternalPathString
          | (T extends `${infer P}${SearchOrHash}`
              ? P extends DynamicRoutes<infer _>
                ? T
                : never
              : T extends DynamicRoutes<infer _>
              ? T
              : never)
    : never;

  /*********
   * Href  *
   *********/

  export type Href<T> = T extends Record<'pathname', string> ? HrefObject<T> : Route<T>;

  export type HrefObject<
    R extends Record<'pathname', string>,
    P = R['pathname'],
  > = P extends DynamicRouteTemplate
    ? { pathname: P; params: InputRouteParams<P> }
    : P extends Route<P>
    ? { pathname: Route<P> | DynamicRouteTemplate; params?: never | InputRouteParams<never> }
    : never;

  /***********************
   * Expo Router Exports *
   ***********************/

  export type Router = Omit<OriginalRouter, 'push' | 'replace' | 'setParams'> & {
    /** Navigate to the provided href. */
    push: <T>(href: Href<T>) => void;
    /** Navigate to route without appending to the history. */
    replace: <T>(href: Href<T>) => void;
    /** Update the current route query params. */
    setParams: <T = ''>(params?: T extends '' ? Record<string, string> : InputRouteParams<T>) => void;
  };

  /** The imperative router. */
  export const router: Router;

  /************
   * <Link /> *
   ************/
  export interface LinkProps<T> extends OriginalLinkProps {
    href: Href<T>;
  }

  export interface LinkComponent {
    <T>(props: React.PropsWithChildren<LinkProps<T>>): JSX.Element;
    /** Helper method to resolve an Href object into a string. */
    resolveHref: <T>(href: Href<T>) => string;
  }

  /**
   * Component to render link to another route using a path.
   * Uses an anchor tag on the web.
   *
   * @param props.href Absolute path to route (e.g. `/feeds/hot`).
   * @param props.replace Should replace the current route without adding to the history.
   * @param props.asChild Forward props to child component. Useful for custom buttons.
   * @param props.children Child elements to render the content.
   * @param props.className On web, this sets the HTML `class` directly. On native, this can be used with CSS interop tools like Nativewind.
   */
  export const Link: LinkComponent;

  /** Redirects to the href as soon as the component is mounted. */
  export const Redirect: <T>(
    props: React.PropsWithChildren<{ href: Href<T> }>
  ) => JSX.Element;

  /************
   * Hooks *
   ************/
  export function useRouter(): Router;

  export function useLocalSearchParams<
    T extends AllRoutes | UnknownOutputParams = UnknownOutputParams,
  >(): T extends AllRoutes ? SearchParams<T> : T;

  /** @deprecated renamed to `useGlobalSearchParams` */
  export function useSearchParams<
    T extends AllRoutes | UnknownOutputParams = UnknownOutputParams,
  >(): T extends AllRoutes ? SearchParams<T> : T;

  export function useGlobalSearchParams<
    T extends AllRoutes | UnknownOutputParams = UnknownOutputParams,
  >(): T extends AllRoutes ? SearchParams<T> : T;

  export function useSegments<
    T extends AbsoluteRoute | RouteSegments<AbsoluteRoute> | RelativePathString,
  >(): T extends AbsoluteRoute ? RouteSegments<T> : T extends string ? string[] : T;
}
