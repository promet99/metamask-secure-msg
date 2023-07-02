import { useCallback, useEffect, useState } from "react";
import { useGetWalletAndPKey } from "./util/wallet";
import {
  useAutoSaveMsg,
  loadStoredMsg,
  useDoesAddressHasStoredMsg,
} from "./util/store";

function App() {
  const [memo, setMemo] = useState("");
  const {
    //
    isLoading: isLoadingUserInfo,
    isSuccessful: suceessfullyloadedUserInfo,
    userWalletAddress,
    userPublicKey,
  } = useGetWalletAndPKey();
  const { hasStoredMsg } = useDoesAddressHasStoredMsg({
    address: userWalletAddress,
  });

  const loadMsg = useCallback(() => {
    const asyncFunction = async () => {
      if (userWalletAddress !== undefined) {
        const msg = await loadStoredMsg({ address: userWalletAddress });
        if (msg !== undefined) {
          setMemo(msg);
        }
      }
    };
    asyncFunction();
  }, [userWalletAddress]);

  const [checkedForSavedMemo, setCheckedForSavedMemo] = useState(false);

  useEffect(() => {
    if (checkedForSavedMemo === true) {
      return;
    }

    setMemo("");
    if (!isLoadingUserInfo && suceessfullyloadedUserInfo) {
      // loadMsg();
    }
  }, [
    checkedForSavedMemo,
    isLoadingUserInfo,
    loadMsg,
    suceessfullyloadedUserInfo,
  ]);

  useAutoSaveMsg({
    address: userWalletAddress,
    publicKey: userPublicKey,
    msg: memo,
    shouldSave: true,
  });

  return (
    <div>
      <h1>Vite + React</h1>
      <div className="card">
        <div>
          {suceessfullyloadedUserInfo &&
          checkedForSavedMemo === false &&
          hasStoredMsg ? (
            <button
              onClick={() => {
                setCheckedForSavedMemo(true);
                loadMsg();
              }}
            >
              Press to Load Saved Memo
            </button>
          ) : (
            <textarea
              value={memo}
              onChange={(e) => {
                setMemo(e.target.value);
              }}
              style={{ width: "100%", height: "100px" }}
            />
          )}
        </div>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
