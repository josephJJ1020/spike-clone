import endCall from "../../images/end_call.png";

import { useSelector, useDispatch } from "react-redux";
import { setIsCalling } from "../../store/slices/callStateSlice";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export const Calling = () => {
  const { isCalling, callee, callType } = useSelector(
    (state) => state.callState
  );
  const dispatch = useDispatch();
  const show = isCalling;

  return (
    <Modal
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      show={show}
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          {callType} Call
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Calling...</h4>
        <p>Waiting for {callee} to respond...</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => dispatch(setIsCalling(false))}>Close</Button>
        <Button
          variant="danger"
          onClick={() => {
            console.log("cancel call");
            dispatch(setIsCalling(false));
            // emit cancel call event
          }}
        >
          <img src={endCall} alt="Cancel call" />
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
