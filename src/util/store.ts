import { useEffect, useState } from "react";
import { encryptAndCompressMsg, decryptCompressedMsg } from "./msg";

export const storeMsg = ({
  address,
  publicKey,
  msg,
}: {
  address: string;
  publicKey: string;
  msg: string;
}) => {
  const processedData = encryptAndCompressMsg({ publicKey, msg });
  localStorage.setItem(address + "_msg", processedData);
};

export const deleteMsg = ({ address }: { address: string }) => {
  localStorage.removeItem(address + "_msg");
};

export const loadStoredMsg = async ({
  address,
}: {
  address: string;
}): Promise<string | undefined> => {
  const storedMsg = localStorage.getItem(address + "_msg");
  if (storedMsg === null) {
    return undefined;
  }
  const { msg: resultMsg } = await decryptCompressedMsg({
    address,
    msg: storedMsg,
  });
  return resultMsg;
};

export const useAutoSaveMsg = ({
  address,
  publicKey,
  msg,
  shouldSave,
}: {
  address: string | undefined;
  publicKey: string | undefined;
  msg: string;
  shouldSave: boolean;
}) => {
  const SAVE_THROTTLE = 200;
  const [throttleTimestamp, setThrottleTimestamp] = useState(() => Date.now());
  useEffect(() => {
    if (
      shouldSave === false ||
      address === undefined ||
      publicKey === undefined
    ) {
      return;
    }
    const now = Date.now();
    if (now - throttleTimestamp < SAVE_THROTTLE) {
      return;
    }
    if (msg.length === 0) {
      deleteMsg({ address });
    } else {
      storeMsg({
        address,
        publicKey,
        msg,
      });
    }
    setThrottleTimestamp(now);
  }, [address, publicKey, msg, throttleTimestamp, shouldSave]);
};

export const doesAddressHasStoredMsg = ({
  address,
}: {
  address: string;
}): boolean => {
  const storedMsg = localStorage.getItem(address + "_msg");
  if (storedMsg === null || storedMsg.length === 0) {
    return false;
  }
  return true;
};

export const useDoesAddressHasStoredMsg = ({
  address,
}: {
  address: string | undefined;
}): { hasStoredMsg: boolean } => {
  const [hasStoredMsg, setHasStoredMsg] = useState(false);
  useEffect(() => {
    setHasStoredMsg(
      address === undefined ? false : doesAddressHasStoredMsg({ address })
    );
  }, [address]);
  return { hasStoredMsg };
};
