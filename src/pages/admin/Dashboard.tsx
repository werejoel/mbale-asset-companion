import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Activity,
  Wrench,
  AlertTriangle,
  Building2,
  DollarSign,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import "./Dashboard.css";
import StatCard from "@/components/StatCard";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { assetsAPI, departmentsAPI, assetCategoriesAPI, faultReportsAPI, assignmentsAPI } from "@/lib/api";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const COLORS = ["hsl(174,62%,32%)", "hsl(38,92%,50%)", "hsl(200,25%,12%)", "hsl(152,60%,40%)", "hsl(200,15%,60%)"];

export default function Dashboard() {
  const {
    data: assets = [],
    isLoading: assetsLoading,
    error: assetsError,
  } = useQuery({ queryKey: ["assets"], queryFn: assetsAPI.getAll });

  const {
    data: departments = [],
    isLoading: departmentsLoading,
    error: departmentsError,
  } = useQuery({ queryKey: ["departments"], queryFn: departmentsAPI.getAll });

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({ queryKey: ["assetCategories"], queryFn: assetCategoriesAPI.getAll });

  const {
    data: faultReports = [],
    isLoading: faultsLoading,
    error: faultsError,
  } = useQuery({ queryKey: ["faultReports"], queryFn: faultReportsAPI.getAll });

  const {
    data: assignments = [],
    isLoading: assignmentsLoading,
    error: assignmentsError,
  } = useQuery({ queryKey: ["assignments"], queryFn: assignmentsAPI.getAll });

  const isLoading = assetsLoading || departmentsLoading || categoriesLoading || faultsLoading || assignmentsLoading;
  const error = assetsError || departmentsError || categoriesError || faultsError || assignmentsError;

  const dashboardStats = useMemo(() => {
    const totalAssets = assets.length;
    const totalValue = assets.reduce((sum, item) => sum + Number(item.purchase_cost || 0), 0);
    const activeAssets = assets.filter((asset) => asset.status === "available").length;
    const underMaintenance = assets.filter((asset) => asset.status === "under_maintenance" || asset.status === "maintenance").length;
    const openFaults = faultReports.filter((fault) => fault.status === "pending").length;
    const disposed = assets.filter((asset) => asset.status === "disposed").length;

    return {
      totalAssets,
      totalValue,
      activeAssets,
      underMaintenance,
      openFaults,
      departments: departments.length,
      disposed,
      pendingAssignments: assignments.filter((assignment) => assignment.status === "active").length,
    };
  }, [assets, departments.length, faultReports, assignments]);

  const categoryData = useMemo(
    () => categories.map((cat) => ({
      name: cat.category_name,
      value: assets.filter((a) => a.category_id === cat.id).length,
    })),
    [assets, categories]
  );

  const deptData = useMemo(
    () => departments.map((d) => ({
      name: d.department_name,
      assets: assets.filter((a) => a.department_id === d.id).length,
    })),
    [assets, departments]
  );

  if (isLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-destructive">Failed to load dashboard data.</div>;
  }

  return (
    <div className="dashboard-page">
      <PageHeader title="Dashboard" description="Mbale Regional Referral Hospital — Asset Overview" />

      {/* Stats */}
      <div className="dashboard-grid dashboard-stats-grid">
        <StatCard title="Total Assets" value={dashboardStats.totalAssets} icon={Package} variant="primary" trend="+12 this month" />
        <StatCard title="Active Assets" value={dashboardStats.activeAssets} icon={Activity} variant="success" />
        <StatCard title="Under Maintenance" value={dashboardStats.underMaintenance} icon={Wrench} variant="accent" />
        <StatCard title="Open Faults" value={dashboardStats.openFaults} icon={AlertTriangle} variant="default" />
      </div>

      <div className="dashboard-grid dashboard-stats-grid">
        <StatCard title="Total Value" value={`UGX ${(dashboardStats.totalValue / 1000000).toFixed(1)}M`} icon={DollarSign} />
        <StatCard title="Departments" value={dashboardStats.departments} icon={Building2} />
        <StatCard title="Disposed" value={dashboardStats.disposed} icon={Package} />
        <StatCard title="Pending Assignments" value={dashboardStats.pendingAssignments} icon={ClipboardList} />
      </div>

      {/* Charts */}
      <div className="dashboard-grid dashboard-charts-grid">
        <div className="dashboard-card">
          <h3 className="dashboard-card-heading">Assets by Category</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2">
            {categoryData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {item.name}
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="dashboard-card-heading">Assets by Department</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(195,15%,88%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="assets" fill="hsl(174,62%,32%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Faults */}
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="dashboard-card-heading">Recent Fault Reports</h3>
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="overflow-x-auto">
          <table className="dashboard-table">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Asset</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {faultReports.map((f) => {
                const asset = assets.find((a) => a.id === f.asset_id);
                return (
                  <tr key={f.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-3 font-medium">{asset?.asset_name}</td>
                    <td className="py-3 px-3 text-muted-foreground max-w-xs truncate">{f.description}</td>
                    <td className="py-3 px-3"><StatusBadge status={f.priority} /></td>
                    <td className="py-3 px-3"><StatusBadge status={f.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
