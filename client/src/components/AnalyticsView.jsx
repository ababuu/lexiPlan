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
} from "lucide-react";
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
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.getAnalytics();
      setAnalyticsData(response.data.data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
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
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
              <p className="text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Documents",
      value: analyticsData?.totalDocuments?.toString() || "0",
      change: "+12%",
      icon: FileText,
      trend: "up",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Messages Sent",
      value: analyticsData?.totalMessages?.toString() || "0",
      change: "+23%",
      icon: MessageSquare,
      trend: "up",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Ready Documents",
      value: analyticsData?.documentsByStatus?.ready?.toString() || "0",
      change: "Ready",
      icon: CheckCircle,
      trend: "up",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Processing",
      value: analyticsData?.documentsByStatus?.processing?.toString() || "0",
      change: "In Progress",
      icon: Clock,
      trend: "neutral",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Analytics Dashboard
        </h2>
        <p className="text-muted-foreground">
          Monitor your LexiPlan AI assistant usage and document insights
        </p>
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
              data={
                analyticsData?.documentsByProject?.map((project) => ({
                  name: project.projectName,
                  documents: project.documentCount,
                })) || []
              }
            >
              <BarChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="documents" fill="hsl(var(--primary))" />
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
              data={
                analyticsData?.messagesByDay?.map((day) => ({
                  date: new Date(day._id).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  }),
                  messages: day.count,
                })) || []
              }
            >
              <BarChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="messages" fill="hsl(var(--secondary))" />
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Recent Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              • Total documents processed: {analyticsData?.totalDocuments || 0}
            </p>
            <p>
              • AI conversations conducted: {analyticsData?.totalMessages || 0}
            </p>
            <p>
              • Projects with documents:{" "}
              {analyticsData?.documentsByProject?.length || 0}
            </p>
            {analyticsData?.messagesByDay?.length > 0 && (
              <p>
                • Most active day:{" "}
                {
                  analyticsData.messagesByDay.reduce((max, day) =>
                    day.count > max.count ? day : max
                  )._id
                }{" "}
                (
                {
                  analyticsData.messagesByDay.reduce((max, day) =>
                    day.count > max.count ? day : max
                  ).count
                }{" "}
                messages)
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsView;
