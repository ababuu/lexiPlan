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
import StatCardSkeleton from "./ui/StatCardSkeleton";
import ChartSkeleton from "./ui/ChartSkeleton";
import TableSkeleton from "./ui/TableSkeleton";
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
        {/* Header */}
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded" />
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton title={true} height="h-64" />
          <ChartSkeleton title={true} height="h-64" />
          <ChartSkeleton title={true} height="h-80" />
          <ChartSkeleton title={true} height="h-80" />
        </div>

        {/* Bottom Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TableSkeleton
            rows={5}
            columns={3}
            headerTitles={["Project", "Documents", "Status"]}
          />
          <TableSkeleton
            rows={5}
            columns={3}
            headerTitles={["Recent", "Type", "Date"]}
          />
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
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Analytics Dashboard
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
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
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="hover:shadow-md transition-shadow duration-200"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-xl sm:text-2xl font-bold">
                  {stat.value}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Documents per Project Chart */}
        <Card className="col-span-1">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Documents per Project
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Distribution of documents across projects
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
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
                  style={{ fontSize: "11px" }}
                />
                <YAxis style={{ fontSize: "11px" }} />
                <Tooltip />
                <Bar dataKey="documentCount" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Activity Chart */}
        <Card className="col-span-1">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
              Weekly Message Activity
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Messages sent over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <ResponsiveContainer
              width="100%"
              height={250}
              data={analyticsData?.messagesByDay}
            >
              <BarChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" style={{ fontSize: "11px" }} />
                <YAxis style={{ fontSize: "11px" }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Document Status Breakdown */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Document Processing Status
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Current status of all documents in your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 sm:p-2 rounded-full bg-green-100 flex-shrink-0">
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium">Ready</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {analyticsData?.documentsByStatus?.ready || 0}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 sm:p-2 rounded-full bg-yellow-100 flex-shrink-0">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium">Processing</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                  {analyticsData?.documentsByStatus?.processing || 0}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 sm:p-2 rounded-full bg-red-100 flex-shrink-0">
                <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium">Error</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">
                  {analyticsData?.documentsByStatus?.error || 0}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Insights */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Document Processing Rate
                </span>
                <span className="text-xs sm:text-sm font-medium">
                  {processingPercentage}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Avg Messages per Conversation
                </span>
                <span className="text-xs sm:text-sm font-medium">
                  {avgMessagesPerConv}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Avg Documents per Project
                </span>
                <span className="text-xs sm:text-sm font-medium">
                  {avgDocsPerProject}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Total Users
                </span>
                <span className="text-xs sm:text-sm font-medium">
                  {analyticsData?.totalUsers || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-2 sm:space-y-3">
              {analyticsData?.recentDocuments?.slice(0, 3).map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-1 gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                    <span
                      className="text-xs sm:text-sm truncate"
                      title={doc.filename}
                    >
                      {doc.filename}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0 ${
                      doc.vectorized
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {doc.vectorized ? "Ready" : "Processing"}
                  </span>
                </div>
              )) || (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  No recent documents
                </p>
              )}

              {analyticsData?.recentConversations
                ?.slice(0, 2)
                .map((conv, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1 gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <span
                        className="text-xs sm:text-sm truncate"
                        title={conv.title}
                      >
                        {conv.title}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground flex-shrink-0">
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
