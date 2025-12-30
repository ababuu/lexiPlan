import { ChatOpenAI } from "@langchain/openai";
import { getContextualAnswer } from "../services/aiService.js";

export const chatWithDocuments = async (req, res) => {
  const { message } = req.body;
  const orgId = req.orgId; // From your auth middleware

  try {
    // 1. Get relevant context from PDFs
    const context = await getContextualAnswer(message, orgId);

    // 2. Initialize the LLM
    const model = new ChatOpenAI({
      modelName: "gpt-4-turbo-preview",
      streaming: true,
    });

    // 3. Set headers for Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // 4. Generate response with Context
    const systemPrompt = `You are a helpful assistant for an organization. 
    Use the following pieces of retrieved context from their uploaded documents to answer the question. 
    If you don't know the answer based on the context, say you don't know.
    
    Context: ${context}`;

    const stream = await model.stream([
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ]);

    // 5. Pipe the stream to the response
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk.content)}\n\n`);
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
