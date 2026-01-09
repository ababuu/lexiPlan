import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import mongoose from "mongoose";

export const processDocument = async (text, docId, orgId, projectId) => {
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
      projectId: projectId.toString(),
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

// Delete vectors for a specific document
export const deleteDocumentVectors = async (docId, orgId) => {
  try {
    const vectorCollection = mongoose.connection.db.collection("vectors");

    const deleteResult = await vectorCollection.deleteMany({
      docId: docId.toString(),
      orgId: orgId.toString(),
    });

    return deleteResult.deletedCount;
  } catch (error) {
    console.error("❌ Error deleting document vectors:", error);
    throw error;
  }
};

// Delete vectors for all documents in a project
export const deleteProjectVectors = async (projectId, orgId) => {
  try {
    const vectorCollection = mongoose.connection.db.collection("vectors");

    // Get all documents for this project first to get their docIds
    const Document = mongoose.model("Document");
    const projectDocuments = await Document.find({
      projectId: projectId.toString(),
      orgId: orgId.toString(),
    }).select("_id");

    if (projectDocuments.length === 0) {
      return 0;
    }

    const docIds = projectDocuments.map((doc) => doc._id.toString());

    const deleteResult = await vectorCollection.deleteMany({
      docId: { $in: docIds },
      orgId: orgId.toString(),
    });

    return deleteResult.deletedCount;
  } catch (error) {
    console.error("❌ Error deleting project vectors:", error);
    throw error;
  }
};
