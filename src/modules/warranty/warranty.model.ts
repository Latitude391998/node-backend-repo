import mongoose, { Schema, Document } from 'mongoose';

/**
 * EncryptedWarrantyClaim
 *
 * Every field below is either an opaque, base64-encoded blob produced by
 * client-side Web Crypto (see frontend lib/crypto.ts) or non-sensitive
 * metadata needed to reverse that encryption client-side later. None of
 * it is meaningful without the user's vault passphrase, which the server
 * never receives and never stores. See warranty.controller.ts for the
 * server-side handling guarantees.
 */
export interface IEncryptedWarrantyClaim extends Document {
  userId: mongoose.Types.ObjectId;
  productId?: mongoose.Types.ObjectId;

  // Opaque envelope-encryption payload — see lib/crypto.ts on the frontend.
  ciphertext: string; // AES-256-GCM ciphertext of the JSON claim details, base64
  iv: string; // AES-256-GCM IV used for the ciphertext above, base64
  salt: string; // PBKDF2 salt used to derive the key-wrapping key, base64
  wrappedKey: string; // The random data-encryption key, wrapped (encrypted) by the PBKDF2-derived key, base64
  wrappedKeyIv: string; // AES-256-GCM IV used when wrapping the data-encryption key, base64
  kdfIterations: number; // PBKDF2 iteration count used, stored so it can evolve over time
  algo: string; // Algorithm identifier, e.g. 'AES-GCM-256'

  status: 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
}

const EncryptedWarrantyClaimSchema = new Schema<IEncryptedWarrantyClaim>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },

    ciphertext: { type: String, required: true },
    iv: { type: String, required: true },
    salt: { type: String, required: true },
    wrappedKey: { type: String, required: true },
    wrappedKeyIv: { type: String, required: true },
    kdfIterations: { type: Number, required: true },
    algo: { type: String, required: true, default: 'AES-GCM-256' },

    status: { type: String, enum: ['SUBMITTED', 'VERIFIED', 'REJECTED'], default: 'SUBMITTED' },
  },
  { timestamps: true },
);

export const EncryptedWarrantyClaim = mongoose.model<IEncryptedWarrantyClaim>(
  'EncryptedWarrantyClaim',
  EncryptedWarrantyClaimSchema,
);
