import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import StatCardSkeleton from "../components/ui/StatCardSkeleton";
import CardSkeleton from "../components/ui/CardSkeleton";
import {
  Plus,
  Upload,
  MessageSquare,
  Search,
  TrendingUp,
  FileText,
  FolderOpen,
  Activity,
  ArrowRight,
  Sparkles,
  Clock,
  BarChart3,
} from "lucide-react";
import { projectsApi, analyticsApi } from "../lib/api";

const HomePage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [projectsResponse, analyticsResponse] = await Promise.all([
        projectsApi.getProjects(),
        analyticsApi.getAnalytics(),
      ]);

      setProjects(projectsResponse.data);
      setAnalyticsData(analyticsResponse.data.data);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const quickActions = [
    {
      title: "New Project",
      description: "Start organizing with a new project",
      icon: Plus,
      action: () => navigate("/projects"),
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Upload Document",
      description: "Add documents to your projects",
      icon: Upload,
      action: () => navigate("/documents"),
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Start Chat",
      description: "Ask AI about your documents",
      icon: MessageSquare,
      action: () => navigate("/chat"),
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "View Analytics",
      description: "Track your usage and insights",
      icon: BarChart3,
      action: () => navigate("/analytics"),
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ];

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-6 w-6 sm:h-8 sm:w-8 bg-muted animate-pulse rounded" />
            <div className="h-8 sm:h-10 w-48 sm:w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-5 sm:h-6 w-80 sm:w-96 bg-muted animate-pulse rounded mx-auto" />
          <div className="h-4 w-64 sm:w-80 bg-muted animate-pulse rounded mx-auto" />

          {/* Search Bar */}
          <div className="max-w-md mx-auto px-4 sm:px-0">
            <div className="h-10 w-full bg-muted animate-pulse rounded" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Quick Actions */}
        <div>
          <div className="h-6 sm:h-8 w-28 sm:w-32 bg-muted animate-pulse rounded mb-4 sm:mb-6" />
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <CardSkeleton contentRows={4} />
            <CardSkeleton contentRows={4} />
            <CardSkeleton contentRows={4} />
            <CardSkeleton contentRows={4} />
          </div>
        </div>

        {/* Recent Activity & Projects */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <CardSkeleton headerHeight="h-6" contentRows={6} />
          <CardSkeleton headerHeight="h-6" contentRows={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
          <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to LexiPlan
          </h1>
        </div>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
          Your intelligent document companion. Organize projects, upload
          documents, and chat with AI to unlock insights from your content.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto px-4 sm:px-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents, conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm sm:text-base"
            />
          </div>
        </form>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="text-center">
          <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-2 sm:px-4">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-blue-100 rounded-lg">
              <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {analyticsData?.totalProjects || 0}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Active Projects
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-2 sm:px-4">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-green-100 rounded-lg">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {analyticsData?.totalDocuments || 0}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Documents
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-2 sm:px-4">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-purple-100 rounded-lg">
              <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {analyticsData?.totalConversations || 0}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Conversations
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-2 sm:px-4">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-orange-100 rounded-lg">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {analyticsData?.totalMessages || 0}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              AI Messages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <CardContent className="p-4 sm:p-6 text-center">
                  <div
                    className={`inline-flex p-2 sm:p-3 rounded-lg text-white ${action.color} mb-3 sm:mb-4`}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">
                    {action.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                    {action.description}
                  </p>
                  <Button variant="outline" size="sm" onClick={action.action}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Recent Activity & Projects */}
      <div className="grid gap-4 sm:gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <section>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">
              Recent Projects
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/projects")}
              className="text-xs sm:text-sm"
            >
              View All
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-2 sm:space-y-2 sm:space-y-3">
            {projects.slice(0, 3).map((project) => (
              <Card
                key={project._id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm sm:text-base truncate">
                          {project.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {project.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center flex-shrink-0">
                      <Clock className="h-3 w-3 mr-1 hidden sm:inline" />
                      <span className="hidden sm:inline">
                        {new Date(
                          project.updatedAt || project.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {projects.length === 0 && (
              <Card>
                <CardContent className="p-6 sm:p-8 text-center">
                  <FolderOpen className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                    No projects yet
                  </p>
                  <Button onClick={() => navigate("/projects")} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Project
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">
              Recent Activity
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/analytics")}
              className="text-xs sm:text-sm"
            >
              View Analytics
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
            </Button>
          </div>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-3 sm:space-y-3 sm:space-y-4">
                {analyticsData?.recentDocuments
                  ?.slice(0, 3)
                  .map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium truncate">
                          {doc.filename}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {doc.vectorized
                            ? "Ready for AI chat"
                            : "Processing..."}
                        </p>
                      </div>
                    </div>
                  )) || null}

                {analyticsData?.recentConversations
                  ?.slice(0, 2)
                  .map((conv, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium truncate">
                          {conv.title}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {conv.messages?.length || 0} messages
                        </p>
                      </div>
                    </div>
                  )) || null}

                {!analyticsData?.recentDocuments?.length &&
                  !analyticsData?.recentConversations?.length && (
                    <div className="text-center py-6 sm:py-8">
                      <Activity className="h-7 w-7 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2 sm:mb-3" />
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                        No recent activity
                      </p>
                      <Button size="sm" onClick={() => navigate("/documents")}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Your First Document
                      </Button>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
