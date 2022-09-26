import React, { useState } from "react";

export default function Video({ remote = false }) {
  const [srcObject, setSrcObject] = useState(null);

  return <video autoPlay muted={remote ? false : true}></video>;
}
