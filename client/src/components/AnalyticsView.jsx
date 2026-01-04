import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import {
  BarChart3,
  FileText,
  MessageSquare,
  TrendingUp,
  Activity,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Button } from "./ui/Button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "./ui/SimpleCharts";
import { analyticsApi } from "../lib/api";

const AnalyticsView = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await analyticsApi.getAnalytics();
      const data = response.data.data;
      setAnalyticsData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadAnalytics(true);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Unable to Load Analytics
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => loadAnalytics()} disabled={loading}>
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate insights and trends from real data
  const totalDocs = analyticsData?.totalDocuments || 0;
  const totalMsgs = analyticsData?.totalMessages || 0;
  const totalConversations = analyticsData?.totalConversations || 0;
  const totalProjects = analyticsData?.totalProjects || 0;
  const readyDocs = analyticsData?.documentsByStatus?.ready || 0;
  const processingDocs = analyticsData?.documentsByStatus?.processing || 0;
  const errorDocs = analyticsData?.documentsByStatus?.error || 0;

  const processingPercentage = analyticsData?.processingRate || 0;
  const avgMessagesPerConv = analyticsData?.avgMessagesPerConversation || 0;
  const avgDocsPerProject = analyticsData?.avgDocumentsPerProject || 0;

  const stats = [
    {
      title: "Total Documents",
      value: totalDocs.toString(),
      change:
        totalProjects > 0 ? `${totalProjects} projects` : "No projects yet",
      icon: FileText,
      trend: "up",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "AI Conversations",
      value: totalConversations.toString(),
      change:
        totalMsgs > 0
          ? `${totalMsgs} total messages`
          : "Start chatting with AI",
      icon: MessageSquare,
      trend: "up",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Ready Documents",
      value: readyDocs.toString(),
      change: `${processingPercentage}% processed`,
      icon: CheckCircle,
      trend: "up",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Active Projects",
      value: totalProjects.toString(),
      change:
        processingDocs > 0 ? `${processingDocs} processing` : "All up to date",
      icon: BarChart3,
      trend: processingDocs > 0 ? "neutral" : "up",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">
            Monitor your LexiPlan AI assistant usage and document insights
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="hover:shadow-md transition-shadow duration-200"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Documents per Project Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Documents per Project
            </CardTitle>
            <CardDescription>
              Distribution of documents across projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer
              width="100%"
              height={250}
              data={analyticsData?.documentsByProject}
            >
              <BarChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="projectName"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="documentCount" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Activity Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-secondary" />
              Weekly Message Activity
            </CardTitle>
            <CardDescription>
              Messages sent over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer
              width="100%"
              height={250}
              data={analyticsData?.messagesByDay}
            >
              <BarChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Document Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Document Processing Status
          </CardTitle>
          <CardDescription>
            Current status of all documents in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Ready</p>
                <p className="text-2xl font-bold text-green-600">
                  {analyticsData?.documentsByStatus?.ready || 0}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-yellow-100">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Processing</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {analyticsData?.documentsByStatus?.processing || 0}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-red-100">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Error</p>
                <p className="text-2xl font-bold text-red-600">
                  {analyticsData?.documentsByStatus?.error || 0}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Document Processing Rate
                </span>
                <span className="text-sm font-medium">
                  {processingPercentage}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Avg Messages per Conversation
                </span>
                <span className="text-sm font-medium">
                  {avgMessagesPerConv}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Avg Documents per Project
                </span>
                <span className="text-sm font-medium">{avgDocsPerProject}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Users
                </span>
                <span className="text-sm font-medium">
                  {analyticsData?.totalUsers || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData?.recentDocuments?.slice(0, 3).map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-1"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span
                      className="text-sm truncate max-w-[200px]"
                      title={doc.filename}
                    >
                      {doc.filename}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      doc.vectorized
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {doc.vectorized ? "Ready" : "Processing"}
                  </span>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">
                  No recent documents
                </p>
              )}

              {analyticsData?.recentConversations
                ?.slice(0, 2)
                .map((conv, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span
                        className="text-sm truncate max-w-[200px]"
                        title={conv.title}
                      >
                        {conv.title}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {conv.messages?.length || 0} msgs
                    </span>
                  </div>
                )) || null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsView;
