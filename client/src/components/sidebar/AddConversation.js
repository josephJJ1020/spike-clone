import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Badge from "react-bootstrap/Badge";
import CloseButtton from "react-bootstrap/CloseButton";

import { useState } from "react";
import { useInput } from "../hooks/useInput";
import { useSelector, useDispatch } from "react-redux";
import { setCreatingConversation } from "../../store/slices/globalsSlice";

export const AddConversation = () => {
  const globalSlice = useSelector((state) => state.global);
  const dispatch = useDispatch();

  const [participant, setParticipant] = useInput("");
  const [participants, setParticipants] = useState([]);

  const addParticipant = () => {
    if (participant.value.length) {
      setParticipants([...participants, participant.value]);
      setParticipant("");
    }
  };

  const removeParticipant = (name) => {
    console.log("clicked!");
    setParticipants(participants.filter((user) => user !== name));
  };

  const show = globalSlice.creatingConversation;
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
            <div>
              {participants &&
                participants.map((participant, index) => (
                  <Badge key={index}>
                    {participant}
                    <CloseButtton
                      onClick={() => removeParticipant(participant)}
                    />
                  </Badge>
                ))}
            </div>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Participants</Form.Label>
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
            onClick={() => dispatch(setCreatingConversation(false))}
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
