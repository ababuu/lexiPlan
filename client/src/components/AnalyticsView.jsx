import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { BarChart3, FileText, MessageSquare, TrendingUp } from "lucide-react";

const AnalyticsView = () => {
  // Mock data for demonstration
  const stats = [
    {
      title: "Total Documents",
      value: "24",
      change: "+12%",
      icon: FileText,
      trend: "up",
    },
    {
      title: "AI Conversations",
      value: "156",
      change: "+23%",
      icon: MessageSquare,
      trend: "up",
    },
    {
      title: "Projects",
      value: "8",
      change: "+2",
      icon: BarChart3,
      trend: "up",
    },
    {
      title: "Monthly Usage",
      value: "2.3k",
      change: "+18%",
      icon: TrendingUp,
      trend: "up",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Analytics</h2>
        <p className="text-muted-foreground">
          Monitor your AI assistant usage and document insights
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center text-sm">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-green-500">{stat.change}</span>
                      <span className="text-muted-foreground ml-1">
                        from last month
                      </span>
                    </div>
                  </div>
                  <Icon className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Coming Soon */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Document Insights</CardTitle>
            <CardDescription>
              Analyze document types, sizes, and processing times
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Charts coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversation Trends</CardTitle>
            <CardDescription>
              Track AI interactions and response quality over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Analytics coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest interactions and document uploads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: "Document uploaded",
                item: "Q4_Financial_Report.pdf",
                time: "2 hours ago",
              },
              {
                action: "AI conversation",
                item: "Marketing strategy discussion",
                time: "4 hours ago",
              },
              {
                action: "Project created",
                item: "Product Launch 2024",
                time: "1 day ago",
              },
              {
                action: "Document processed",
                item: "User_Research_Data.pdf",
                time: "2 days ago",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.item}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{activity.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsView;
