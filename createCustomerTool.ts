import { defineTool } from "@github/copilot-sdk";

export const createCustomerTool = defineTool("create_customer", {
  description: "Create a new customer in the CRM system.",
  
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The customer's full name",
      },
      email: {
        type: "string",
        description: "The customer's email address",
      },
      phone: {
        type: "string",
        description: "The customer's phone number",
      },
    },
    required: ["name", "email"],
  },

  handler: async ({ name, email, phone }) => {
    console.log("CREATE CUSTOMER TOOL CALLED", name, email, phone);

    // For now, don't call your database yet.
    // Just simulate the operation.

    return {
      success: true,
      customer: {
        name,
        email,
        phone,
      },
    };
  },
});