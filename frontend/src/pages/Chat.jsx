import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { api } from "../api/client.js";
import { getSocket } from "../api/socket.js";
import { PageHeader, Card, Badge, Empty, Alert, Field, Modal, formatDateTime } from "../components/ui.jsx";

export default function Chat() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [conversations, setConversations] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState("");
  const [msgType, setMsgType] = useState("TEXT");
  const [typingUser, setTypingUser] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState([]);
  const [groupTitle, setGroupTitle] = useState("");
  const [sending, setSending] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  const active = conversations?.find((c) => c.id === activeId);

  const loadConversations = async (keepActive) => {
    try {
      const res = await api("/chat/conversations/my");
      setConversations(res.data);
      if (!keepActive && res.data.length > 0 && !activeId) {
        setActiveId(res.data[0].id);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api("/chat/users");
      setUsers(res.data);
    } catch {
    }
  };

  useEffect(() => {
    loadConversations();
    loadUsers();
    const socket = getSocket(true);
    socketRef.current = socket;

    socket.on("message:new", (msg) => {
      setMessages((prev) =>
        prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
      );
      loadConversations(true);
    });
    socket.on("typing", ({ conversationId, email, isTyping }) => {
      if (conversationId !== activeId) return;
      setTypingUser(isTyping ? email : "");
      if (isTyping) {
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setTypingUser(""), 2500);
      }
    });
    return () => {
      socket.off("message:new");
      socket.off("typing");
    };
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const load = async () => {
      try {
        const res = await api(`/chat/conversations/${activeId}/messages`);
        setMessages(res.data);
        socketRef.current?.emit("join", activeId);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  const toggleSelect = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const createChat = async () => {
    if (selected.length === 0) {
      setNotice("Select at least one person");
      return;
    }
    try {
      const isGroup = selected.length > 1 || (isAdmin && groupTitle.trim() !== "");
      const res = await api("/chat/conversations", {
        method: "POST",
        body: {
          participantIds: selected,
          isGroup,
          title: groupTitle.trim() || undefined,
        },
      });
      setShowNew(false);
      setSelected([]);
      setGroupTitle("");
      await loadConversations(true);
      setActiveId(res.data.id);
      setNotice(isGroup ? "Group created" : "Chat ready");
    } catch (err) {
      setNotice(err.message);
    }
  };

  const send = async (e) => {
    e?.preventDefault();
    if (!draft.trim() || !activeId || sending) return;
    setSending(true);
    const body = draft.trim();
    const type = msgType;
    setDraft("");
    try {
      const socket = socketRef.current;
      const ack = await new Promise((resolve) => {
        if (!socket?.connected) return resolve(null);
        socket.emit(
          "message:send",
          { conversationId: activeId, body, type },
          (res) => resolve(res),
        );
        setTimeout(() => resolve(null), 2500);
      });
      if (!ack || !ack.success) {
        try {
          const res = await api(`/chat/conversations/${activeId}/messages`, {
            method: "POST",
            body: { body, type },
          });
          setMessages((prev) =>
            prev.some((m) => m.id === res.data.id) ? prev : [...prev, res.data],
          );
        } catch (restErr) {
          throw new Error(ack && !ack.success ? ack.message : restErr.message);
        }
      }
    } catch (err) {
      setNotice(err.message);
      setDraft(body);
    } finally {
      setSending(false);
      setMsgType("TEXT");
    }
  };

  const handleTyping = (v) => {
    setDraft(v);
    socketRef.current?.emit("typing", { conversationId: activeId, isTyping: v.length > 0 });
  };

  const chatName = (c) => {
    if (c.title) return c.title;
    const others = c.participants.filter((p) => p.user.id !== user.id);
    if (c.isGroup) return `Group (${c.participants.length})`;
    return others[0]?.user?.employee?.name || others[0]?.user?.email || "Chat";
  };

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  return (
    <div className="content">
      <PageHeader
        title="Team Chat"
        subtitle={`Chatting as ${user?.email || ""}`}
        actions={<button className="btn btn-primary" onClick={() => setShowNew(true)}>New chat</button>}
      />
      {notice && <Alert tone="success">{notice}</Alert>}
      {error && <Alert>{error}</Alert>}

      <div className="chat-layout">
        <Card>
          <div className="chat-list">
            {!conversations ? (
              <div className="empty-state">Loading...</div>
            ) : conversations.length === 0 ? (
              <Empty message="No chats yet" hint="Click New chat to message HR or a teammate" />
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  className={`chat-item ${c.id === activeId ? "active" : ""}`}
                  onClick={() => setActiveId(c.id)}
                >
                  <div className="chat-item-top">
                    <strong>{chatName(c)}</strong>
                    {c.isGroup && <Badge tone="accent">Group</Badge>}
                  </div>
                  <div className="chat-item-last">
                    {c.messages?.[0]?.type === "MEETING" ? "📅 " : ""}
                    {c.messages?.[0]?.body?.slice(0, 48) || "No messages yet"}
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        <Card>
          {!active ? (
            <Empty message="Select a chat" />
          ) : (
            <div className="chat-main">
              <div className="chat-header">
                <strong>{chatName(active)}</strong>
                <span className="chat-members">
                  {active.participants.map((p) => p.user.employee?.name || p.user.email).join(", ")}
                </span>
              </div>
              <div className="chat-messages">
                {!user?.id && <Alert>Session expired — please sign out and sign in again.</Alert>}
                {messages.map((m) => {
                  const mine =
                    (user?.id && String(m.senderId) === String(user.id)) ||
                    (user?.email && m.sender?.email === user.email);
                  return (
                    <div key={m.id} className={`msg ${mine ? "mine" : ""} ${m.type === "MEETING" ? "meeting" : ""}`}>
                      {m.type === "MEETING" && <div className="msg-tag">📅 MEETING NOTICE</div>}
                      <div className="msg-sender">{mine ? "You" : (m.sender?.email || "Teammate")}</div>
                      <div className="msg-body">{m.body}</div>
                      <div className="msg-time">{formatDateTime(m.createdAt)}</div>
                    </div>
                  );
                })}
                {typingUser && <div className="typing">{typingUser} typing...</div>}
                <div ref={bottomRef} />
              </div>
              <form className="chat-input" onSubmit={send}>
                {isAdmin && (
                  <select className="select" value={msgType} onChange={(e) => setMsgType(e.target.value)} title="Message type">
                    <option value="TEXT">Text</option>
                    <option value="MEETING">📅 Meeting</option>
                  </select>
                )}
                <input
                  className="input"
                  placeholder={msgType === "MEETING" ? "Meeting Sunday 10am, Hall A..." : "Type a message..."}
                  value={draft}
                  onChange={(e) => handleTyping(e.target.value)}
                />
                <button className="btn btn-primary" disabled={sending || !draft.trim()}>
                  {sending ? "..." : "Send"}
                </button>
              </form>
            </div>
          )}
        </Card>
      </div>

      {showNew && (
        <Modal
          title="New chat"
          onClose={() => setShowNew(false)}
          footer={
            <>
              <button className="btn" onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createChat}>Start</button>
            </>
          }
        >
          {isAdmin && (
            <Field label="Group title (optional = group chat)">
              <input className="input" value={groupTitle} onChange={(e) => setGroupTitle(e.target.value)} placeholder="e.g. Backend team" />
            </Field>
          )}
          <Field label={isAdmin ? "Pick people" : "Pick one person"}>
            <div className="user-pick">
              {users.map((u) => (
                <label key={u.id} className="user-pick-row">
                  <input
                    type="checkbox"
                    checked={selected.includes(u.id)}
                    onChange={() => toggleSelect(u.id)}
                  />
                  <span>
                    <strong>{u.employee?.name || u.email}</strong>
                    <small> {u.email} · {u.role}</small>
                  </span>
                </label>
              ))}
              {users.length === 0 && <Empty message="No users found" />}
            </div>
          </Field>
          {!isAdmin && <Alert tone="success">Employees start 1-1 chats. Groups are created by HR.</Alert>}
        </Modal>
      )}
    </div>
  );
}
