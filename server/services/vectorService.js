import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
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

  // 3. EMBED & STORE
  const vectorCollection = mongoose.connection.db.collection("vectors");

  await MongoDBAtlasVectorSearch.fromDocuments(
    chunksWithMetadata,
    new OpenAIEmbeddings(),
    {
      collection: vectorCollection,
      indexName: "vector_index",
      textKey: "text",
      embeddingKey: "embedding",
    }
  );
};
