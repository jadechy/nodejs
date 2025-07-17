import { createHash } from "crypto";

export const sha256 = (str: string): string => {
  return createHash("sha256").update(str).digest("hex");
};

export const sha512 = (str: string): string => {
  return createHash("sha512").update(str).digest("hex");
};
