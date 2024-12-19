import { Request } from "express";

type valueType = "string" | "number" | "stringArray" | "numberArray";

export const getParamStr = (param: any) => {
  if (typeof param !== "string") return undefined;
  return param;
};

export const getParamNum = (param: any) => {
  if (typeof param !== "string") return;
  const num = Number.parseInt(param);
  if (Number.isNaN(num)) return;

  return num;
};

export const getParamStrArray = (param: any) => {
  const arr: string[] = [];
  if (Array.isArray(param)) {
    for (const val of param) {
      const str = getParamStr(val);
      if (str) arr.push(str);
    }
  } else {
    const str = getParamStr(param);
    if (str) arr.push(str);
  }

  return arr;
};

export const getParamNumArray = (param: any) => {
  const arr: number[] = [];
  if (Array.isArray(param)) {
    for (const val of param) {
      const num = getParamNum(val);
      if (num) arr.push(num);
    }
  } else {
    const num = getParamNum(param);
    if (num) arr.push(num);
  }

  return arr;
};
