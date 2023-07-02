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
  }, [checkedForSavedMemo]);

  useEffect(() => {
    setCheckedForSavedMemo(false);
  }, [userWalletAddress]);

  const { isSaved, manuallySave } = useAutoSaveMsg({
    address: userWalletAddress,
    publicKey: userPublicKey,
    msg: memo,
    shouldSave: true,
  });

  return (
    <div>
      <h1>Secure Memo with Metamask🦊 </h1>
      <div className="card">
        <div>isSaved:{isSaved ? "O" : "X"}</div>
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
              Press to Load Encrypted Memo
            </button>
          ) : (
            <div>
              <div>
                {manuallySave && (
                  <button
                    onClick={() => {
                      manuallySave();
                    }}
                  >
                    Manual Save
                  </button>
                )}
              </div>
              <textarea
                value={memo}
                onChange={(e) => {
                  setMemo(e.target.value);
                }}
                placeholder="Write anything. It will be encrypted and auto-saved locally."
                style={{ width: "100%", height: "100px" }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
