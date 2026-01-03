import { AdminConfigurator } from "@/components/Admin/AdminConfigurator";

export const ConfiguratorPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl overflow-hidden p-6">
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Interne Configurator</h2>
          <p className="text-muted-foreground">
            Genereer direct een voorbeeld zonder klantgegevens.
          </p>
        </div>
        <AdminConfigurator />
      </div>
    </div>
  );
};

