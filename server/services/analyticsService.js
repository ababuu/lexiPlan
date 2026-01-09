import Analytics from "../models/Analytics.js";

const RECENT_DOC_LIMIT = 10;
const RECENT_CONV_LIMIT = 10;
const MESSAGE_DAY_LIMIT = 14; // keep last 2 weeks for charts

const defaultSnapshot = (orgId) => ({
  orgId,
  totalDocuments: 0,
  totalMessages: 0,
  totalConversations: 0,
  totalProjects: 0,
  totalUsers: 0,
  documentsByStatus: { ready: 0, processing: 0, error: 0 },
  documentsByProject: [],
  messagesByDay: [],
  recentDocuments: [],
  recentConversations: [],
  avgMessagesPerConversation: 0,
  avgDocumentsPerProject: 0,
  processingRate: 0,
  lastUpdated: new Date(),
});

const computeDerived = (snapshot) => {
  const { totalDocuments, totalMessages, totalConversations, totalProjects } =
    snapshot;
  const ready = snapshot.documentsByStatus?.ready || 0;

  snapshot.processingRate =
    totalDocuments > 0 ? Math.round((ready / totalDocuments) * 100) : 0;
  snapshot.avgMessagesPerConversation =
    totalConversations > 0 ? Math.round(totalMessages / totalConversations) : 0;
  snapshot.avgDocumentsPerProject =
    totalProjects > 0 ? Math.round(totalDocuments / totalProjects) : 0;
  snapshot.lastUpdated = new Date();
};

export const ensureAnalytics = async (orgId) => {
  let snapshot = await Analytics.findOne({ orgId });
  if (!snapshot) {
    snapshot = await Analytics.create(defaultSnapshot(orgId));
  }
  return snapshot;
};

const upsertProjectEntry = (snapshot, projectId, projectName) => {
  const key = projectId ? projectId.toString() : "unassigned";
  const existing = snapshot.documentsByProject.find(
    (p) => (p.projectId ? p.projectId.toString() : "unassigned") === key
  );
  if (existing) return existing;
  const entry = {
    projectId: projectId || undefined,
    projectName: projectName || "Unassigned",
    documentCount: 0,
    vectorizedCount: 0,
  };
  snapshot.documentsByProject.push(entry);
  return entry;
};

const upsertMessageDay = (snapshot, dateStr) => {
  const existing = snapshot.messagesByDay.find((d) => d._id === dateStr);
  if (existing) return existing;
  const entry = { _id: dateStr, count: 0 };
  snapshot.messagesByDay.push(entry);
  return entry;
};

const trimCollections = (snapshot) => {
  snapshot.recentDocuments = snapshot.recentDocuments.slice(
    0,
    RECENT_DOC_LIMIT
  );
  snapshot.recentConversations = snapshot.recentConversations.slice(
    0,
    RECENT_CONV_LIMIT
  );
  // Keep most recent MESSAGE_DAY_LIMIT entries by date
  snapshot.messagesByDay.sort((a, b) => a._id.localeCompare(b._id));
  if (snapshot.messagesByDay.length > MESSAGE_DAY_LIMIT) {
    snapshot.messagesByDay = snapshot.messagesByDay.slice(-MESSAGE_DAY_LIMIT);
  }
};

export const recordProject = async ({ orgId, title }) => {
  const snapshot = await ensureAnalytics(orgId);
  snapshot.totalProjects += 1;
  computeDerived(snapshot);
  await snapshot.save();
};

export const recordDocument = async ({
  orgId,
  filename,
  vectorized,
  projectId,
  projectName,
}) => {
  const snapshot = await ensureAnalytics(orgId);
  snapshot.totalDocuments += 1;

  if (vectorized) snapshot.documentsByStatus.ready += 1;
  else snapshot.documentsByStatus.processing += 1;

  const projectEntry = upsertProjectEntry(snapshot, projectId, projectName);
  projectEntry.documentCount += 1;
  if (vectorized) projectEntry.vectorizedCount += 1;

  snapshot.recentDocuments.unshift({
    filename,
    vectorized: !!vectorized,
    createdAt: new Date(),
    projectId,
    projectName: projectName || "Unassigned",
  });

  trimCollections(snapshot);
  computeDerived(snapshot);
  await snapshot.save();
};

export const markDocumentVectorized = async ({
  orgId,
  projectId,
  projectName,
}) => {
  const snapshot = await ensureAnalytics(orgId);
  if (snapshot.documentsByStatus.processing > 0) {
    snapshot.documentsByStatus.processing -= 1;
  }
  snapshot.documentsByStatus.ready += 1;

  const projectEntry = upsertProjectEntry(snapshot, projectId, projectName);
  projectEntry.vectorizedCount += 1;

  computeDerived(snapshot);
  await snapshot.save();
};

export const recordConversation = async ({
  orgId,
  title,
  messagesCount = 0,
  projectId,
  projectName,
}) => {
  const snapshot = await ensureAnalytics(orgId);

  snapshot.totalConversations += 1;
  snapshot.totalMessages += messagesCount;

  // Messages by day (use today)
  const todayStr = new Date().toISOString().slice(0, 10);
  const dayEntry = upsertMessageDay(snapshot, todayStr);
  dayEntry.count += messagesCount;

  snapshot.recentConversations.unshift({
    title,
    messagesCount,
    updatedAt: new Date(),
    projectId,
    projectName: projectName || "Unassigned",
  });

  trimCollections(snapshot);
  computeDerived(snapshot);
  await snapshot.save();
};

export const recordUser = async ({ orgId }) => {
  const snapshot = await ensureAnalytics(orgId);
  snapshot.totalUsers += 1;
  computeDerived(snapshot);
  await snapshot.save();
};

export const getAnalyticsSnapshot = async (orgId) => {
  const snapshot = await ensureAnalytics(orgId);
  return snapshot;
};
