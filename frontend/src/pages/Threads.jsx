import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Threads() {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    api.get("/chat/threads/")
      .then(res => setThreads(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Your Chats</h2>

      {threads.map(thread => (
        <div key={thread.id}>
          <strong>{thread.name || "Direct Chat"}</strong>
          {thread.last_message && (
            <p>{thread.last_message.text}</p>
          )}
        </div>
      ))}
    </div>
  );
}