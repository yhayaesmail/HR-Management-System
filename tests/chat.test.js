import {
  createConversation,
  getMessages,
  sendMessage,
} from "../src/modules/chat/chat.service.js";
import { makeUser, removeUser, disconnect } from "./helpers.js";

describe("chat", () => {
  const ids = [];
  let admin;
  let empA;
  let empB;
  let outsider;

  beforeAll(async () => {
    admin = await makeUser("ADMIN");
    empA = await makeUser("EMPLOYEE");
    empB = await makeUser("EMPLOYEE");
    outsider = await makeUser("EMPLOYEE");
    ids.push(admin.user.id, empA.user.id, empB.user.id, outsider.user.id);
  });

  afterAll(async () => {
    for (const id of ids) await removeUser(id);
    await disconnect();
  });

  const me = (u) => ({ id: u.user.id, email: u.email, role: u.user.role });

  test("creates 1-1 conversation with both participants", async () => {
    const c = await createConversation(
      { participantIds: [empB.user.id] },
      me(empA),
    );
    expect(c.participants).toHaveLength(2);
  });

  test("reuses existing 1-1 conversation", async () => {
    const first = await createConversation({ participantIds: [empB.user.id] }, me(empA));
    const second = await createConversation({ participantIds: [empB.user.id] }, me(empA));
    expect(second.id).toBe(first.id);
  });

  test("outsider cannot read messages", async () => {
    const c = await createConversation({ participantIds: [empB.user.id] }, me(empA));
    await expect(getMessages(c.id, me(outsider))).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  test("employee cannot send meeting notice", async () => {
    const c = await createConversation({ participantIds: [empB.user.id] }, me(empA));
    await expect(
      sendMessage(c.id, { body: "Meet at 10", type: "MEETING" }, me(empA)),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test("admin meeting notice is saved with type", async () => {
    const c = await createConversation(
      { participantIds: [empA.user.id], isGroup: true, title: "Team" },
      me(admin),
    );
    const m = await sendMessage(
      c.id,
      { body: "Meeting Sunday 10am", type: "MEETING" },
      me(admin),
    );
    expect(m.type).toBe("MEETING");
    const history = await getMessages(c.id, me(empA));
    expect(history.map((x) => x.id)).toContain(m.id);
  });
});
