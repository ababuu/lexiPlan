import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { MongoDBAtlasVectorSearch } from "@langchain/community/vectorstores/mongodb_atlas";
import mongoose from "mongoose";

export const getContextualAnswer = async (query, orgId) => {
  const vectorCollection = mongoose.connection.db.collection("vectors");

  // 1. Initialize Vector Store connection
  const vectorStore = new MongoDBAtlasVectorSearch(new OpenAIEmbeddings(), {
    collection: vectorCollection,
    indexName: "vector_index",
    textKey: "text",
    embeddingKey: "embedding",
  });

  // 2. RETRIEVE: Search only chunks belonging to this Org (Multi-tenancy!)
  const relevantDocs = await vectorStore.similaritySearch(query, 3, {
    preFilter: {
      "metadata.orgId": { $eq: orgId.toString() },
    },
  });

  // 3. Combine chunks into a context string
  const context = relevantDocs.map((doc) => doc.pageContent).join("\n\n");

  return context;
};
