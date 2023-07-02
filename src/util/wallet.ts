import { useEffect, useState } from "react";

const failedResult = {
  isSuccessful: false,
  userWalletAddress: undefined,
  userPublicKey: undefined,
};

export const getWalletAndPKey = async () => {
  if (!window.ethereum) {
    return failedResult;
  }
  // retrieve address & pkey
  const userWalletAddressResult = (await window.ethereum.request({
    method: "eth_requestAccounts",
    params: [],
  })) as string[] | { code: number };

  if (typeof (userWalletAddressResult as { code: number }).code === "number") {
    // fail!
    return failedResult;
  }
  const userWalletAddress = (userWalletAddressResult as string[])[0];

  const storedPK = localStorage.getItem(userWalletAddress + "_pk");
  let userPublicKey = "";
  if (storedPK === null) {
    const storedUserPublicKey = (await window.ethereum.request({
      method: "eth_getEncryptionPublicKey",
      params: [userWalletAddress],
    })) as string | { code: number };
    if (typeof storedUserPublicKey === "string") {
      localStorage.setItem(userWalletAddress + "_pk", storedUserPublicKey);
      userPublicKey = storedUserPublicKey;
    } else {
      // failed!
      return failedResult;
    }
  } else {
    userPublicKey = storedPK;
  }
  return { userWalletAddress, userPublicKey, isSuccessful: true };
};

export const useGetWalletAndPKey = () => {
  const [userState, setUserState] = useState<{
    isLoading: boolean;
    isSuccessful: boolean;
    userWalletAddress: string | undefined;
    userPublicKey: string | undefined;
  }>({
    isLoading: true,
    ...failedResult,
  });

  useEffect(() => {
    if (window.ethereum === undefined) {
      return;
    }
    const accountChangeHandler = async () => {
      const fetchedResult = await getWalletAndPKey();
      //   console.log({ fetchedResult });
      setUserState({
        isLoading: false,
        ...fetchedResult,
      });
    };
    accountChangeHandler()
    window.ethereum.on("accountsChanged", accountChangeHandler);
    return () => {
      if (window.ethereum === undefined) {
        return;
      }
      window.ethereum.removeListener("accountsChanged", accountChangeHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.ethereum]);

  return userState;
};

// const { publicKeyConvert } = require('secp256k1')
// const createKeccakHash = require('keccak')
// const { toChecksumAddress } = require('ethereum-checksum-address')

// function publicKeyToAddress (publicKey) {
//   if (!Buffer.isBuffer(publicKey)) {
//     if (typeof publicKey !== 'string') {
//       throw new Error('Expected Buffer or string as argument')
//     }

//     publicKey = publicKey.slice(0, 2) === '0x' ? publicKey.slice(2) : publicKey
//     publicKey = Buffer.from(publicKey, 'hex')
//   }

//   publicKey = Buffer.from(publicKeyConvert(publicKey, false)).slice(1)
//   const hash = createKeccakHash('keccak256').update(publicKey).digest()
//   return toChecksumAddress(hash.slice(-20).toString('hex'))
// }

// module.exports = publicKeyToAddress
