import { useSelector, useDispatch } from "react-redux";
import Alert from "react-bootstrap/Alert";
import { setFlashMsg } from "../../store/slices/globalsSlice";

export default function FlashMessage() {
  const { flashMsg } = useSelector((state) => state.global);
  const dispatch = useDispatch();
  return (
    <>
      {flashMsg && (
        <Alert
          variant="warning"
          onClose={() => dispatch(setFlashMsg(null))}
          dismissible
        >
          <p>{flashMsg.message}</p>
        </Alert>
      )}
    </>
  );
}
