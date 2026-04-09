import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { assetsAPI, departmentsAPI, assetCategoriesAPI } from "@/lib/api";

export default function Assets() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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

  const isLoading = assetsLoading || departmentsLoading || categoriesLoading;
  const error = assetsError || departmentsError || categoriesError;

  const filtered = assets.filter((a: any) => {
    const matchSearch = a.asset_name.toLowerCase().includes(search.toLowerCase()) ||
      a.asset_tag.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (isLoading) {
    return <div className="px-4 sm:px-6 md:p-6">Loading assets...</div>;
  }

  if (error) {
    return <div className="px-4 sm:px-6 md:p-6 text-destructive">Unable to load assets.</div>;
  }

  return (
    <div className="px-4 sm:px-6 md:p-6">
      <PageHeader title="Assets" description="Manage all hospital assets">
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Asset
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {["All", "available", "under_maintenance", "disposed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {s === "available" ? "Available" : s === "under_maintenance" ? "Under Maintenance" : s === "disposed" ? "Disposed" : "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Asset Tag</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Condition</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Cost</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a: any) => {
                const cat = categories.find((c: any) => c.id === a.category_id);
                const dept = departments.find((d: any) => d.id === a.department_id);
                return (
                  <tr key={a.id} className="border-t border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer">
                    <td className="py-3 px-4 font-mono text-xs text-primary">{a.asset_tag}</td>
                    <td className="py-3 px-4 font-medium">{a.asset_name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{cat?.category_name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{dept?.department_name}</td>
                    <td className="py-3 px-4"><StatusBadge status={a.asset_condition} /></td>
                    <td className="py-3 px-4"><StatusBadge status={a.status} /></td>
                    <td className="py-3 px-4 text-right font-medium">UGX {Number(a.purchase_cost).toLocaleString()}</td>
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
