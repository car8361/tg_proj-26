**Social media web app project**
**- stack:**
  *frontend: react + tailwind css*
  *backend: nest js + prisma orm*
  *database: postgre sql*
  *setup with: docker compose + dockerfile + nginx*

**Frontend routes**:
- **/app** - reworked these routes into 1: - **/chats** **/dashboard** **/friends**
- **/home** - homepage
- **/login** - login
- **/register** - register

**Backend routes (prefix /api)**:
- **relations** - relationships: friends, blocks
- **chats** - chats, messages, adding people to chats..
- **auth** - login, register..

**LATEST Terra week 3**
- Reworked frontend UI
- Reworked some backend chat logic (sadly DMs will be next week)
- Started researching about presigned URLs (will have to rewrite slightly object service)
- Fixed bugs

Terra week 2
- Fixed (if not most) all backend bigint parsing errors
- You can send messages from frontend
- Connected websockets (not all and not tested), though since you cannot add members to a chat right now it's not really testable
- Overall frontend and backend work, almost no changes in the db

Terra week 1
- Code cleanups
- Debugging
- Better understanding of how to use React hooks
- Finding mismatches between app and backend logic
- Working e-mail 2FA
- Some working endpoints (more + sockets implemented will be in week 2)
- more

- Terra prep week 3:
- little to no frontend (plain home, header, footer, login, register)
- backend routes and some safety (but missing html sanitizing, etc.) - relations, chats, auth, a bit of other stuff
- NOTE: in this demo frontend and backend aren't connected
