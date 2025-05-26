import Crypto from "crypto";

export const generateSecretHash = () => {
  return Crypto.randomBytes(32).toString("hex");
};
