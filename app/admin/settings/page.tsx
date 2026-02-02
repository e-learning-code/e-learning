import { createClient } from "@/lib/server";
import { FeeSettingsForm } from "@/components/fee-settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: feeSettings } = await supabase
    .from("fee_settings")
    .select("*")
    .single();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure platform settings and payment information.
        </p>
      </div>

      <FeeSettingsForm settings={feeSettings} />
    </div>
  );
}
