import Joi from 'joi';

// Structural validation only. The server cannot and must not validate the
// *content* of a warranty claim (invoice number, GSTIN, etc.) because it
// never receives that content in plaintext — only these opaque blobs.
export const submitClaimSchema = Joi.object({
  productId: Joi.string().hex().length(24).allow(null, '').optional(),

  ciphertext: Joi.string().base64().required(),
  iv: Joi.string().base64().required(),
  salt: Joi.string().base64().required(),
  wrappedKey: Joi.string().base64().required(),
  wrappedKeyIv: Joi.string().base64().required(),

  // Floor guards against a tampered/weakened client silently requesting a
  // trivially brute-forceable KDF. The frontend default is far higher.
  kdfIterations: Joi.number().integer().min(100000).required(),
  algo: Joi.string().valid('AES-GCM-256').required(),
});
