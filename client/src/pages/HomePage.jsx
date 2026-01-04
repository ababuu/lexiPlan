import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
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
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to LexiPlan
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your intelligent document companion. Organize projects, upload
          documents, and chat with AI to unlock insights from your content.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents, conversations, or projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2"
            />
          </div>
        </form>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-lg">
              <FolderOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">
              {analyticsData?.totalProjects || 0}
            </div>
            <p className="text-sm text-muted-foreground">Active Projects</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold">
              {analyticsData?.totalDocuments || 0}
            </div>
            <p className="text-sm text-muted-foreground">Documents</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold">
              {analyticsData?.totalConversations || 0}
            </div>
            <p className="text-sm text-muted-foreground">Conversations</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold">
              {analyticsData?.totalMessages || 0}
            </div>
            <p className="text-sm text-muted-foreground">AI Messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`inline-flex p-3 rounded-lg text-white ${action.color} mb-4`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
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
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Projects</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/projects")}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {projects.slice(0, 3).map((project) => (
              <Card
                key={project._id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FolderOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{project.title}</h3>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {project.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(
                        project.updatedAt || project.createdAt
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {projects.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No projects yet</p>
                  <Button onClick={() => navigate("/projects")}>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/analytics")}
            >
              View Analytics
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {analyticsData?.recentDocuments
                  ?.slice(0, 3)
                  .map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{doc.filename}</p>
                        <p className="text-xs text-muted-foreground">
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
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{conv.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {conv.messages?.length || 0} messages
                        </p>
                      </div>
                    </div>
                  )) || null}

                {!analyticsData?.recentDocuments?.length &&
                  !analyticsData?.recentConversations?.length && (
                    <div className="text-center py-8">
                      <Activity className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm mb-4">
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
