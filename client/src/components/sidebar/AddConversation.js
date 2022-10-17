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
import { setErrMsg } from "../../store/slices/callStateSlice";

export const AddConversation = () => {
  const { userData } = useSelector((state) => state.userData);
  const { creatingConversation } = useSelector((state) => state.global);
  const { conversations } = useSelector((state) => state.conversations);
  const dispatch = useDispatch();

  const { createNewConversation } = useContext(AppContext);

  const [participant, setParticipant] = useInput("");
  const [participants, setParticipants] = useState([]);
  const [creatingConvoErr, setCreatingConvoErr] = useState("");

  const [warning, setWarning] = useState(null);

  const addParticipant = () => {
    if (participant.value.length) {
      if (!emailValidator.validate(participant.value)) {
        setWarning("Must enter email");
        return;
      }
      setParticipants([...participants, { email: `${participant.value}` }]);
      setParticipant("");
    }
  };

  const removeParticipant = (email) => {
    setParticipants(participants.filter((user) => user.email !== email));
  };

  const createConversation = () => {
    let convoExists = false;

    if (!participants) {
      setCreatingConvoErr("No users selected");

      convoExists = true;
      setTimeout(() => {
        setCreatingConvoErr("");
        return;
      }, 2000);
    }

    let participantsForNewConversation = [
      ...participants,
      { email: userData.email },
    ];

    // remove duplicates
    participantsForNewConversation = participantsForNewConversation.reduce(
      (unique, o) => {
        if (
          !unique.some((obj) => obj.email === o.email && obj.value === o.value)
        ) {
          unique.push(o);
        }
        return unique;
      },
      []
    );

    // sort
    participantsForNewConversation = participantsForNewConversation.sort(
      (a, b) => a.email.localeCompare(b.email)
    );

    let identifier = participantsForNewConversation
      .map((user) => user.email)
      .join(",");

    conversations.forEach((convo) => {
      if (convo.identifier === identifier) {
        setCreatingConvoErr("Conversation already exists");

        convoExists = true;
        setTimeout(() => {
          setCreatingConvoErr("");
          return;
        }, 2000);
      }
    });

    if (!convoExists) {
      createNewConversation(participantsForNewConversation);
      dispatch(setCreatingConversation(false));
    }
  };

  const show = creatingConversation;

  useEffect(() => {
    setTimeout(() => {
      setWarning(null);
    }, 3000);
  }, [warning]);

  return (
    <>
      <Modal
        centered
        show={show}
        onHide={() => dispatch(setCreatingConversation(false))}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Conversation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Participants</Form.Label>
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
              {warning && <p className="text-warning">{warning}</p>}
              <Form.Control
                as="input"
                rows={3}
                {...participant}
                placeholder="Enter participant's email"
              />
              <Button onClick={addParticipant}>Add participant</Button>
            </Form.Group>
          </Form>
          <section className="text-warning">
            {creatingConvoErr ? creatingConvoErr : null}
          </section>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={(e) => {
              e.preventDefault();
              dispatch(setCreatingConversation(false));
            }}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={(e) => {
              e.preventDefault();
              createConversation();
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
      Create conversation
    </Button>
  );
}
