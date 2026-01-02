import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import mongoose from "mongoose";

export const getContextualAnswer = async (query, orgId, projectId = null) => {
  const vectorCollection = mongoose.connection.db.collection("vectors");

  // 1. Initialize Vector Store connection (Gemini embeddings)
  const vectorStore = new MongoDBAtlasVectorSearch(
    new GoogleGenerativeAIEmbeddings({
      model: "text-embedding-004",
    }),
    {
      collection: vectorCollection,
      indexName: "vector_index",
      textKey: "text",
      embeddingKey: "embedding",
    }
  );

  // 2. RETRIEVE: Build filter for org and optionally project
  const filter = {
    orgId: { $eq: orgId.toString() },
  };

  // Add project filter if specified
  if (projectId) {
    filter.projectId = { $eq: projectId.toString() };
  }

  const relevantDocs = await vectorStore.similaritySearch(query, 3, {
    preFilter: filter,
  });

  // 3. Combine chunks into a context string
  const context = relevantDocs.map((doc) => doc.pageContent).join("\n\n");

  return context;
};
