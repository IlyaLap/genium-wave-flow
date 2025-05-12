
/// <reference types="vite/client" />

// Define global variables used in the project
declare const __APP_VERSION__: string;
declare const __BUILD_TIME__: string;

// Define window extensions
interface Window {
  __REACT_QUERY_GLOBAL_CALLBACKS__?: unknown;
  netlify?: unknown;
  __appDiagnostics?: any;
}
