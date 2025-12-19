import { useEffect, useState } from "react";
import { fetchThreads } from "../api/chat.api";

export default function ThreadList({ onSelect }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThreads()
      .then((res) => {
        setThreads(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading chats...</div>;

  return (
    <div className="thread-list">
      {threads.map((thread) => {
        const otherUser = thread.members.find(
          (m) => m.id !== Number(localStorage.getItem("user_id"))
        );

        return (
          <div
            key={thread.id}
            className="thread-item"
            onClick={() => onSelect(thread)}
          >
            <div className="avatar">
              {otherUser?.is_online && <span className="online-dot" />}
            </div>

            <div className="thread-info">
              <div className="username">{otherUser?.username}</div>
              <div className="last-message">
                {thread.last_message?.text || "No messages yet"}
              </div>
            </div>

            {thread.unread_count > 0 && (
              <span className="unread">{thread.unread_count}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}