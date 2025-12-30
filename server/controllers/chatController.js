import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getContextualAnswer } from "../services/aiService.js";

export const chatWithDocuments = async (req, res) => {
  const { message } = req.body;
  const orgId = req.orgId;

  try {
    // 1. Get relevant context from documents
    const context = await getContextualAnswer(message, orgId);

    // 2. Initialize Gemini LLM (streaming)
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      temperature: 0,
      streaming: true,
    });

    // 3. Set headers for Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // 4. System prompt with retrieved context
    const systemPrompt = `
        You are a helpful assistant for an organization.
        Use the provided context to answer the user's question.
        If the answer is not in the context, say you don't know.

        Context:
        ${context}
        `;

    // 5. Stream response
    const stream = await model.stream([
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ]);

    for await (const chunk of stream) {
      if (chunk?.content) {
        res.write(`data: ${JSON.stringify(chunk.content)}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("Chat Error:", err);
    res
      .status(500)
      .write(`data: ${JSON.stringify({ error: "AI failed to respond" })}\n\n`);
    res.end();
  }
};
