import { useEffect, useState } from "react";
import { fetchThreads } from "../api/chat.api";
import "./ThreadList.css";

export default function ThreadList({ onSelect }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);


  const getAvatarUrl = (user) => {
    if (!user?.avatar) return null;
    return user.avatar.startsWith("http")
      ? user.avatar
      : `http://127.0.0.1:8000${user.avatar}`;
  };

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
              {getAvatarUrl(otherUser) ? (
                <img
                  src={getAvatarUrl(otherUser)}
                  alt={otherUser.username}
                  className="avatar-img"
                />
              ) : (
                <div className="avatar-fallback">
                  {otherUser?.username?.[0]?.toUpperCase()}
                </div>
              )}

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