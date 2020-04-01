import getHash from "./get-hash";

export async function get({ name, version }: { name: string; version: string }) {
  const hash = getHash({name, version});
  if(hash) {
    return null;
  }
}