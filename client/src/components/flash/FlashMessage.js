import { useSelector, useDispatch } from "react-redux";
import Alert from "react-bootstrap/Alert";
import { setFlashMsg } from "../../store/slices/globalsSlice";

export default function FlashMessage() {
  const global = useSelector((state) => state.global);
  const dispatch = useDispatch();
  return (
    <>
      {global.flashMsg && (
        <Alert
          variant="warning"
          onClose={() => dispatch(setFlashMsg(null))}
          dismissible
        >
          <p>{global.flashMsg.message}</p>
        </Alert>
      )}
    </>
  );
}
