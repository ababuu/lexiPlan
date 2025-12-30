import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import mongoose from "mongoose";

export const processDocument = async (text, docId, orgId) => {
  // 1. SPLIT
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await splitter.createDocuments([text]);

  // 2. ADD METADATA
  const chunksWithMetadata = docs.map((chunk) => ({
    ...chunk,
    metadata: {
      orgId: orgId.toString(),
      docId: docId.toString(),
    },
  }));

  // 3. EMBED & STORE (Gemini)
  const vectorCollection = mongoose.connection.db.collection("vectors");

  await MongoDBAtlasVectorSearch.fromDocuments(
    chunksWithMetadata,
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
};
