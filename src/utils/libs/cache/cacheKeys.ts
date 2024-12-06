import { Request } from "express";

export const extractCacheKey = (request: Request) => {
  if (request.cacheKey) return request.cacheKey;
  const route = request.path;
  const queryParams = request.query;
  const base = "new-chat-cache-" + route;
  if (!queryParams) return base;
  const paramKeys = Object.keys(queryParams).sort();
  if (!paramKeys.length) return base;
  let paramSignature = "";

  paramKeys.forEach((key, i) => {
    const val = queryParams[key];
    const isLastKey = i === paramKeys.length - 1;
    if (!val) return;
    const isArray = Array.isArray(val);

    if (isArray && !val.length) return;
    paramSignature += key + "=";
    if (Array.isArray(val)) {
      val.sort().forEach((v, j) => {
        const isLastVal = j === val.length - 1;
        paramSignature += v;
        if (!isLastVal) {
          paramSignature += ",";
        }
      });
    } else {
      paramSignature += val;
    }

    if (!isLastKey) {
      paramSignature += "&";
    }
  });

  if (!paramSignature) return base;

  const cachedKey = base + "?" + paramSignature;

  request.cacheKey = cachedKey;
  return cachedKey;
};
