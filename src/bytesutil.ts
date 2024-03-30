export function base64ToBase64url(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=*$/g, "");
}
export function base64urlToBase64(b64url: string): string {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  let padding = b64.length % 4;
  if (padding > 0) {
    b64 += "====".slice(padding);
  }
  return b64;
}

export function u8arrToRaw(uarr: Uint8Array): string {
  let ret = "";
  let i = 0;
  while (i < uarr.length) {
    ret += String.fromCharCode(uarr[i]);
    i++;
  }
  return ret;
}
export function rawToU8arr(raw: string): Uint8Array {
  let arr = new Uint8Array(raw.length);
  let i = 0;
  while (i < arr.length) {
    arr[i] = raw.charCodeAt(i);
    i++;
  }
  return arr;
}

export function u8arrToBase64(uarr: Uint8Array): string {
  let raw = u8arrToRaw(uarr);
  return btoa(raw);
}
export function base64ToU8arr(b64: string): Uint8Array {
  let raw = atob(b64);
  return rawToU8arr(raw);
}

export function u8arrToBase64url(uarr: Uint8Array): string {
  let raw = u8arrToRaw(uarr);
  let b64 = btoa(raw);
  return base64ToBase64url(b64);
}
export function base64urlToU8arr(b64url: string): Uint8Array {
  let b64 = base64urlToBase64(b64url);
  let raw = atob(b64);
  return rawToU8arr(raw);
}
