import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Download, Calendar, DollarSign, Users, FileText, CheckCircle, AlertCircle } from "lucide-react";

export function TeacherBilling() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("premium");

  // Mock billing data
  const currentPlan = {
    name: "Premium",
    price: 29.99,
    billing: "monthly",
    studentsLimit: 100,
    currentStudents: 45,
    features: [
      "Unlimited assignments",
      "AI-powered grading",
      "Advanced analytics",
      "Priority support",
      "Custom branding"
    ]
  };

  const billingHistory = [
    {
      id: 1,
      date: "2024-01-01",
      description: "Premium Plan - Monthly",
      amount: 29.99,
      status: "paid",
      invoice: "INV-001"
    },
    {
      id: 2,
      date: "2023-12-01", 
      description: "Premium Plan - Monthly",
      amount: 29.99,
      status: "paid",
      invoice: "INV-002"
    },
    {
      id: 3,
      date: "2023-11-01",
      description: "Premium Plan - Monthly", 
      amount: 29.99,
      status: "paid",
      invoice: "INV-003"
    }
  ];

  const plans = [
    {
      name: "Basic",
      price: 9.99,
      students: 25,
      features: ["Basic assignments", "Standard grading", "Email support"]
    },
    {
      name: "Premium", 
      price: 29.99,
      students: 100,
      features: ["Unlimited assignments", "AI grading", "Analytics", "Priority support"]
    },
    {
      name: "Enterprise",
      price: 99.99,
      students: "Unlimited",
      features: ["Everything in Premium", "Custom integrations", "Dedicated support", "SLA"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const studentUsagePercentage = (currentPlan.currentStudents / currentPlan.studentsLimit) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Navigation userRole="teacher" />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Billing & Subscription</h1>
                <p className="text-muted-foreground">Manage your subscription and billing information</p>
              </div>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download Invoice
              </Button>
            </div>

            {/* Current Plan Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentPlan.name}</div>
                  <p className="text-xs text-muted-foreground">
                    ${currentPlan.price}/{currentPlan.billing}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Feb 1</div>
                  <p className="text-xs text-muted-foreground">
                    ${currentPlan.price} due
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Students Used</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentPlan.currentStudents}/{currentPlan.studentsLimit}
                  </div>
                  <Progress value={studentUsagePercentage} className="h-2 mt-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$359.88</div>
                  <p className="text-xs text-muted-foreground">
                    Last 12 months
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Current Plan Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Subscription</CardTitle>
                  <CardDescription>
                    You're currently on the {currentPlan.name} plan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{currentPlan.name} Plan</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Student limit</span>
                      <span>{currentPlan.studentsLimit} students</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Billing cycle</span>
                      <span>Monthly</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Next payment</span>
                      <span>February 1, 2024</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Plan Features</h4>
                    <div className="space-y-1">
                      {currentPlan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      className="w-full gap-2"
                      onClick={() => navigate("/teacher/billing/payment-methods")}
                    >
                      <CreditCard className="h-4 w-4" />
                      Update Payment Method
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Cancel Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Billing History */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>
                    Your recent billing transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingHistory.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {new Date(transaction.date).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {transaction.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              ${transaction.amount}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(`/api/invoices/${transaction.invoice}`, '_blank')}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Invoice
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Available Plans */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <CardDescription>
                  Upgrade or downgrade your subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {plans.map((plan) => (
                    <Card key={plan.name} className={`cursor-pointer transition-colors ${
                      plan.name.toLowerCase() === currentPlan.name.toLowerCase() 
                        ? 'ring-2 ring-primary' 
                        : 'hover:bg-muted/50'
                    }`}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          {plan.name.toLowerCase() === currentPlan.name.toLowerCase() && (
                            <Badge>Current</Badge>
                          )}
                        </div>
                        <div className="text-3xl font-bold">
                          ${plan.price}
                          <span className="text-sm font-normal text-muted-foreground">/month</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                          Up to {plan.students} students
                        </div>
                        
                        <div className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              {feature}
                            </div>
                          ))}
                        </div>

                        <Button 
                          className="w-full"
                          disabled={plan.name === currentPlan.name}
                          onClick={() => navigate(`/teacher/billing/upgrade?plan=${plan.name.toLowerCase()}`)}
                        >
                          {plan.name === currentPlan.name ? "Current Plan" : "Upgrade"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}