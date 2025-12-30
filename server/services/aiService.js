import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import mongoose from "mongoose";

export const getContextualAnswer = async (query, orgId) => {
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

  // 2. RETRIEVE: Org-scoped similarity search (multi-tenancy safe)
  const relevantDocs = await vectorStore.similaritySearch(query, 3, {
    preFilter: {
      "metadata.orgId": { $eq: orgId.toString() },
    },
  });

  // 3. Combine chunks into a context string
  const context = relevantDocs.map((doc) => doc.pageContent).join("\n\n");

  return context;
};
