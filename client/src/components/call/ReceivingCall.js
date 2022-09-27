import endCall from "../../images/end_call.png";
import acceptCallImg from "../../images/voice_call.png";

import { useSelector, useDispatch } from "react-redux";
import { setReceivingOffer } from "../../store/slices/callStateSlice";

import { useContext } from "react";
import { AppContext } from "../../context";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export const ReceivingCall = () => {
  const { receivingOffer, remoteCaller, callType } = useSelector(
    (state) => state.callState
  );

  const { rejectCall, acceptCall } = useContext(AppContext);

  const dispatch = useDispatch();
  const show = receivingOffer;

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
        <h4>{remoteCaller} wants to call!</h4>
        <p>Accept or reject {remoteCaller}'s call request</p>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="success"
          onClick={() => {
            acceptCall(remoteCaller);
            dispatch(setReceivingOffer(false));
          }}
        >
          <img src={acceptCallImg} alt="Accept call" />
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            console.log("cancel call");
            rejectCall(remoteCaller);
            dispatch(setReceivingOffer(false));
            // emit cancel call event
          }}
        >
          <img src={endCall} alt="Cancel call" />
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
