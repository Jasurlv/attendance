import { createSite } from "../actions";
import { SiteForm, emptySite } from "../site-form";

export default function NewSitePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl">Add a site</h1>
      <SiteForm action={createSite} defaults={emptySite} submitLabel="Save site" />
    </div>
  );
}
