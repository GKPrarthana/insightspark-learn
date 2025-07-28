import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    label: string;
    type: "up" | "down" | "neutral";
  };
  progress?: {
    value: number;
    label: string;
  };
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  progress, 
  badge, 
  className = "" 
}: StatsCardProps) {
  const getTrendIcon = (type: "up" | "down" | "neutral") => {
    switch (type) {
      case "up":
        return <TrendingUp className="w-3 h-3" />;
      case "down":
        return <TrendingDown className="w-3 h-3" />;
      case "neutral":
        return <Minus className="w-3 h-3" />;
    }
  };

  const getTrendColor = (type: "up" | "down" | "neutral") => {
    switch (type) {
      case "up":
        return "text-accent";
      case "down":
        return "text-destructive";
      case "neutral":
        return "text-muted-foreground";
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          {badge && (
            <Badge variant={badge.variant || "outline"} className="text-xs">
              {badge.text}
            </Badge>
          )}
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <div className={`flex items-center space-x-1 text-xs ${getTrendColor(trend.type)}`}>
              {getTrendIcon(trend.type)}
              <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
            </div>
          )}
        </div>
        
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend.label}
          </p>
        )}
        
        {progress && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">{progress.label}</span>
              <span className="font-medium">{progress.value}%</span>
            </div>
            <Progress value={progress.value} className="h-1.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}