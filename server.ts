import "dotenv/config";
import express, { Request, Response } from "express";
import { CopilotClient, CopilotSession, approveAll } from "@github/copilot-sdk";
import { createCustomerTool } from "./createCustomerTool";

interface ChatRequestBody {
  message: string;
}

interface ChatResponseBody {
  response: string;
}

async function createChatApp(): Promise<{
  app: express.Express;
  copilot: CopilotClient;
}> {
  const app = express();

  app.use(express.json());
  app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Welcome to the Chat API" });
  });

  const copilot = new CopilotClient({
    gitHubToken: process.env.GITHUB_TOKEN,
    useLoggedInUser: false,
  });

  await copilot.start();

  const session: CopilotSession = await copilot.createSession({
    model: "gpt-5",
    tools: [createCustomerTool],
    systemMessage: {
      mode: 'append',
      content: `You are a CRM assistant.

When the user asks to create a customer:

1. Collect all required information.
2. Do not create the customer immediately.
3. Once all required information is available, show the user
   the complete customer information that will be created.
4. Ask the user for explicit confirmation.
5. Only create the customer after the user explicitly confirms.
6. Never assume that the initial request to create a customer
   is itself confirmation.

Example:

User: Create John Doe with email john@example.com

Assistant:
I'll create the following customer:

Name: John Doe
Email: john@example.com

Would you like me to create this customer?

User: Yes

Assistant:
[execute create_customer]`,
    },
    onPermissionRequest: approveAll,
  });

  app.post(
    "/chat",
    async (
      req: Request<{}, ChatResponseBody, ChatRequestBody>,
      res: Response<ChatResponseBody>,
    ) => {
      const { message } = req.body;

      const result = await session.sendAndWait({ prompt: message });

      res.json({
        response: result?.data.content ?? "",
      });
    },
  );

  return { app, copilot };
}

async function main(): Promise<void> {
  const { app } = await createChatApp();

  const port = process.env.PORT || 5000;

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

main().catch((error: unknown) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
