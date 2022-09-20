import { useContext, useState } from "react";
import { AppContext } from "../../context";
import Alert from "react-bootstrap/Alert";

export default function FlashMessage() {
  const { flashMsg, setFlashMsg } = useContext(AppContext);

  return (
    <>
      {flashMsg && (
        <Alert variant="warning" onClose={() => setFlashMsg(null)} dismissible>
          <p>{flashMsg.message}</p>
        </Alert>
      )}
    </>
  );
}
