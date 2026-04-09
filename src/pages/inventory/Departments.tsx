import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import { Building2, MapPin, User, Phone } from "lucide-react";
import { departmentsAPI, assetsAPI } from "@/lib/api";

export default function Departments() {
  const {
    data: departments = [],
    isLoading: departmentsLoading,
    error: departmentsError,
  } = useQuery({ queryKey: ["departments"], queryFn: departmentsAPI.getAll });

  const {
    data: assets = [],
    isLoading: assetsLoading,
    error: assetsError,
  } = useQuery({ queryKey: ["assets"], queryFn: assetsAPI.getAll });

  const isLoading = departmentsLoading || assetsLoading;
  const error = departmentsError || assetsError;

  if (isLoading) {
    return <div className="p-6">Loading departments...</div>;
  }

  if (error) {
    return <div className="p-6 text-destructive">Unable to load departments.</div>;
  }

  return (
    <div className="p-6">
      <PageHeader title="Departments" description="Hospital departments and their asset allocations" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept: any) => {
          const deptAssets = assets.filter((a: any) => a.department_id === dept.id);
          return (
            <div key={dept.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer animate-fade-in">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{dept.department_name}</h3>
                  <p className="text-xs text-muted-foreground">{deptAssets.length} assets assigned</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" /> {dept.location}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-3.5 h-3.5" /> {dept.head_of_department}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" /> {dept.contact}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
