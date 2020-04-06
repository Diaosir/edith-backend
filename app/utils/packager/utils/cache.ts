import getHash from "./get-hash";
import Cache from "file-system-cache";
 
const cache = Cache({
  basePath: "./.editcache", // Optional. Path where cache files are stored (default).
  ns: "my-namespace" // Optional. A grouping namespace for items.
});
export async function get(key: string) {
  try{
    return await cache.get(key);
  } catch(error) {
    return null;
  }
}
export async function set(key: string, content: string) {
  try{
    return await cache.set(key, content);
  } catch(error) {
    return null;
  }
}