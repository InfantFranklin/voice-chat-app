import React, { useState } from "react";
import Join from "./components/Join";
import ChatRoom from "./components/ChatRoom";

const App = () => {
  const [channel, setChannel] = useState("");

  return (
    <div>
      {channel ? <ChatRoom channel={channel} /> : <Join onJoin={setChannel} />}
    </div>
  );
};

export default App;
