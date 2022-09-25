import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Badge from "react-bootstrap/Badge";
import CloseButtton from "react-bootstrap/CloseButton";

import emailValidator from "email-validator";

import { useEffect, useState, useContext } from "react";
import { useInput } from "../hooks/useInput";
import { useSelector, useDispatch } from "react-redux";

import { setCreatingConversation } from "../../store/slices/globalsSlice";
import { AppContext } from "../../context";

export const AddConversation = () => {
  const userDataSlice = useSelector((state) => state.userData);
  const globalSlice = useSelector((state) => state.global);
  const dispatch = useDispatch();

  const { createNewConversation } = useContext(AppContext);

  const [participant, setParticipant] = useInput("");
  const [participants, setParticipants] = useState([]);

  const [warning, setWarning] = useState(null);

  const addParticipant = () => {
    if (participant.value.length) {
      if (!emailValidator.validate(participant.value)) {
        setWarning("Must enter email");
        return;
      }
      setParticipants([...participants, { email: participant.value }]);
      setParticipant("");
    }
  };

  const removeParticipant = (email) => {
    console.log("clicked!");
    setParticipants(participants.filter((user) => user.email !== email));
  };

  const createConversation = () => {
    createNewConversation([
      ...participants,
      { email: userDataSlice.userData.email },
    ]);
  };

  const show = globalSlice.creatingConversation;

  useEffect(() => {
    setTimeout(() => {
      setWarning(null);
    }, 3000);
  }, [warning]);

  return (
    <>
      <Modal
        show={show}
        onHide={() => dispatch(setCreatingConversation(false))}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Conversation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Conversation name</Form.Label>
              <Form.Control
                type="text"
                placeholder="conversation name"
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Subject (optional)</Form.Label>
              <Form.Control type="text" placeholder="Subject" autoFocus />
            </Form.Group>
            <div>
              {participants &&
                participants.map((participant, index) => (
                  <Badge key={index}>
                    {participant.email}
                    <CloseButtton
                      onClick={() => removeParticipant(participant.email)}
                    />
                  </Badge>
                ))}
            </div>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Participants</Form.Label>
              {warning && <p className="text-warning">{warning}</p>}
              <Form.Control as="input" rows={3} {...participant} />
              <Button onClick={addParticipant}>Add participant</Button>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => dispatch(setCreatingConversation(false))}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              createConversation();
              dispatch(setCreatingConversation(false));
            }}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default function AddConversationButton() {
  const dispatch = useDispatch();
  return (
    <Button
      style={{ backgroundColor: "#FFB739", color: "#FA6121", border: "none" }}
      className="shadow-none"
      onClick={() => dispatch(setCreatingConversation(true))}
    >
      Add conversation
    </Button>
  );
}
