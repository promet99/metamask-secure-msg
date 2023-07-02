import { encryptSafely } from "@metamask/eth-sig-util";
import { compressToUTF16, decompressFromUTF16 } from "lz-string";

// connect to metamask

// get address

// address => public key
// https://docs.metamask.io/wallet/reference/eth_getencryptionpublickey
// await window.ethereum.request({
//   "method": "eth_getEncryptionPublicKey",
//   "params": [
//     null
//   ]
// });

export const encryptAndCompressMsg = ({
  publicKey,
  msg,
}: {
  publicKey: string;
  msg: string;
}) => {
  // encrpyt and compress text
  const encryptedMsg = encryptSafely({
    publicKey,
    data: msg,
    version: "x25519-xsalsa20-poly1305",
  });
  const compressedEncrpytedMsg = JSON.stringify(encryptedMsg);
  return compressToUTF16(compressedEncrpytedMsg);
};

const failedResult = {
  isSuccessful: false as const,
  msg: undefined,
};

export const decryptCompressedMsg = async ({
  address,
  msg,
}: {
  address: string;
  msg: string;
}) => {
  const uncompressedMsg = decompressFromUTF16(msg);
  // encrpyt and compress text
  if (!window.ethereum) {
    return failedResult;
  }

  try {
    const decryptResult = (await window.ethereum.request({
      method: "eth_decrypt",
      params: [uncompressedMsg, address],
    })) as string;
    const parsedDecryptResult = JSON.parse(decryptResult) as
      | { code: number }
      | { data: string; padding: string };

    if (typeof (parsedDecryptResult as { code: number }).code === "number") {
      return failedResult;
    }
    return {
      isSuccessful: true as const,
      msg: (parsedDecryptResult as { data: string }).data,
    };
  } catch (e) {
    console.log(e);
    return failedResult;
  }
};
