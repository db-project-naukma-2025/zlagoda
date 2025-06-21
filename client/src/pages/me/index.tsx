import {
  IconCalendar,
  IconClock,
  IconCoins,
  IconReceipt,
  IconShoppingCart,
  IconTrendingUp,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMyEmployee } from "@/lib/api/employees/hooks";

export default function MePage() {
  const { data: employeeData, isLoading, error } = useGetMyEmployee();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !employeeData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">
              {error
                ? "Failed to load employee information"
                : "No employee data found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { employee, statistics, work_experience_days, age } = employeeData;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          View your personal information and work statistics
        </p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUser className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="font-semibold">Full Name</p>
              <p className="text-muted-foreground">
                {employee.empl_surname} {employee.empl_name}{" "}
                {employee.empl_patronymic ?? ""}
              </p>
            </div>
            <div>
              <p className="font-semibold">Employee ID</p>
              <p className="text-muted-foreground">{employee.id_employee}</p>
            </div>
            <div>
              <p className="font-semibold">Role</p>
              <Badge
                variant={
                  employee.empl_role === "manager" ? "default" : "secondary"
                }
              >
                {employee.empl_role}
              </Badge>
            </div>
            <div>
              <p className="font-semibold">Age</p>
              <p className="text-muted-foreground">{age} years</p>
            </div>
            <div>
              <p className="font-semibold">Work Experience</p>
              <p className="text-muted-foreground">
                {Math.floor(work_experience_days / 365)} years,{" "}
                {work_experience_days % 365} days
              </p>
            </div>
            <div>
              <p className="font-semibold">Salary</p>
              <p className="text-muted-foreground">
                ₴
                {employee.salary.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Contact Information</p>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Phone: {employee.phone_number}
                </p>
                <p className="text-sm text-muted-foreground">
                  Address: {employee.street}, {employee.city},{" "}
                  {employee.zip_code}
                </p>
              </div>
            </div>
            <div>
              <p className="font-semibold">Employment Details</p>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Date of Birth:{" "}
                  {new Date(employee.date_of_birth).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Start Date:{" "}
                  {new Date(employee.date_of_start).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTrendingUp className="h-5 w-5" />
            Work Statistics
          </CardTitle>
          <CardDescription>
            Your performance metrics and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              description="Checks processed"
              icon={<IconReceipt className="h-4 w-4" />}
              title="Total Checks"
              value={statistics.total_checks.toString()}
            />
            <StatCard
              description="Revenue generated"
              icon={<IconCoins className="h-4 w-4" />}
              title="Total Sales"
              value={`₴${statistics.total_sales_amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
            <StatCard
              description="Products sold"
              icon={<IconShoppingCart className="h-4 w-4" />}
              title="Items Sold"
              value={statistics.total_items_sold.toString()}
            />
            <StatCard
              description="Customers served"
              icon={<IconUsers className="h-4 w-4" />}
              title="Customers"
              value={statistics.customers_served.toString()}
            />
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <IconCalendar className="h-4 w-4 text-muted-foreground" />
                <p className="font-semibold">Days Worked</p>
              </div>
              <p className="text-2xl font-bold">{statistics.days_worked}</p>
              <p className="text-sm text-muted-foreground">Days with sales</p>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <IconCoins className="h-4 w-4 text-muted-foreground" />
                <p className="font-semibold">Average Check</p>
              </div>
              <p className="text-2xl font-bold">
                ₴
                {statistics.average_check_amount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-sm text-muted-foreground">Per transaction</p>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <IconClock className="h-4 w-4 text-muted-foreground" />
                <p className="font-semibold">Last Activity</p>
              </div>
              <p className="text-lg font-bold">
                {statistics.most_recent_check_date
                  ? new Date(
                      statistics.most_recent_check_date,
                    ).toLocaleDateString()
                  : "No recent activity"}
              </p>
              <p className="text-sm text-muted-foreground">Most recent check</p>
            </div>
          </div>

          {statistics.most_sold_product_name && (
            <>
              <Separator className="my-6" />
              <div className="p-4 rounded-lg border bg-card">
                <h4 className="font-semibold mb-2">Top Selling Product</h4>
                <div className="flex items-center justify-between">
                  <span className="text-lg">
                    {statistics.most_sold_product_name}
                  </span>
                  <Badge variant="outline">
                    {statistics.most_sold_product_quantity} units sold
                  </Badge>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="font-semibold">{title}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="p-4 rounded-lg border" key={i}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
