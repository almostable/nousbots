import { randomInt } from "node:crypto";

function generateOTP(length = 5) {
  const max = 10 ** length;
  return randomInt(0, max).toString().padStart(length, "0");
}

export { generateOTP };
