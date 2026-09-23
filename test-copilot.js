import { CopilotClient } from "@github/copilot-sdk";
import dotenv from "dotenv";

dotenv.config();

const client = new CopilotClient({
  gitHubToken: process.env.GITHUB_TOKEN,
  useLoggedInUser: false,
});

const session = await client.createSession({
  model: "claude-sonnet-5"
});

const response = await session.sendAndWait({
  prompt: "Who are you?"
});

console.log(response?.data?.content);

await client.stop();