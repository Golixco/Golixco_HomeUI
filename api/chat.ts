import { createChatHandler } from '../server/chat.ts';

// Static imports bundle the authoritative JSON and approved destinations into the function.
// The identical Node handler is mounted by Vite in local development.
export default createChatHandler();
