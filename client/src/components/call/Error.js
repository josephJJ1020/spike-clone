import { useSelector, useDispatch } from "react-redux";
import { setErrMsg } from "../../store/slices/callStateSlice";

import { useEffect } from "react";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export const Error = () => {
  const { errMsg, callType } = useSelector((state) => state.callState);
  const dispatch = useDispatch();
  const show = errMsg !== null;

  useEffect(() => {
    setTimeout(() => {
      setErrMsg(null);
    }, 5000);
  });

  return (
    <Modal
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      show={show}
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">{callType} Call</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Call cancelled</h4>
        <p>{errMsg}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => {
            dispatch(setErrMsg(null));
          }}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
