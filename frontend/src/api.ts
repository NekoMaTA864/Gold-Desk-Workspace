import {requestBackendJSON} from './backendTransport';

export async function api<T>(path:string, body?:unknown):Promise<T> {
  if (import.meta.env.MODE === 'pages') {
    const {browserAPI}=await import('./demo');
    return await browserAPI(path,body) as T;
  }
  return requestBackendJSON<T>(path,body);
}
export const key = () => crypto.randomUUID();
