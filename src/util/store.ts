import { useCallback, useEffect, useState } from "react";
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
}): {
  isSaved: boolean;
  manuallySave?: () => void;
} => {
  const SAVE_THROTTLE = 200;
  const [throttleTimestamp, setThrottleTimestamp] = useState(() => Date.now());

  const [isSaved, setIsSaved] = useState(false);

  const saveIfValid = useCallback(() => {
    setIsSaved(false);
    if (
      shouldSave === false ||
      address === undefined ||
      publicKey === undefined
    ) {
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
    setIsSaved(() => true);
  }, [address, msg, publicKey, shouldSave]);

  useEffect(() => {
    const now = Date.now();
    if (now - throttleTimestamp < SAVE_THROTTLE) {
      return;
    }
    saveIfValid();
    setThrottleTimestamp(now);
  }, [saveIfValid, throttleTimestamp]);

  return {
    isSaved,
    manuallySave: saveIfValid,
  };
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
