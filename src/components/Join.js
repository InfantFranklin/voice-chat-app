import React, { useState } from "react";

const Join = ({ onJoin }) => {
  const [channel, setChannel] = useState("");

  return (
    <div>
      <input
        type="text"
        value={channel}
        onChange={(e) => setChannel(e.target.value)}
        placeholder="Enter Channel Name"
      />
      <button onClick={() => onJoin(channel)}>Join</button>
    </div>
  );
};

export default Join;
