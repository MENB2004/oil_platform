//src/app/audit/page.tsx
"use client";

import AuditForm from "@/components/audit/AuditForm";

export default function AuditPage() {
  return (
    <main className="py-16 px-6 h-[100vh]">
      <AuditForm householdId="demo-household-001" />
    </main>
  );
}
