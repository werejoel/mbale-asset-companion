import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import { Truck, Mail, Phone, User } from "lucide-react";
import { suppliersAPI } from "@/lib/api";

export default function Suppliers() {
  const {
    data: suppliers = [],
    isLoading,
    error,
  } = useQuery({ queryKey: ["suppliers"], queryFn: suppliersAPI.getAll });

  if (isLoading) {
    return <div className="px-4 sm:px-6 md:p-6">Loading suppliers...</div>;
  }

  if (error) {
    return <div className="px-4 sm:px-6 md:p-6 text-destructive">Unable to load suppliers.</div>;
  }

  return (
    <div className="px-4 sm:px-6 md:p-6">
      <PageHeader title="Suppliers" description="Manage equipment and service suppliers" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {suppliers.map((s: any) => (
          <div key={s.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow animate-fade-in">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Truck className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">{s.supplier_name}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><User className="w-3.5 h-3.5" /> {s.contact_person}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3.5 h-3.5" /> {s.phone}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3.5 h-3.5" /> {s.email}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
