"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function AdminPage() {
  // sample stats
  const stats = [
    { label: "Monthly Recurring Revenue", value: "$42,350" },
    { label: "Active Users", value: "12,482" },
    { label: "New Signups (30d)", value: "1,204" },
    { label: "Churn (30d)", value: "1.2%" },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <motion.div key={s.label} whileHover={{ scale: 1.02 }}>
            <Card>
              <CardHeader>
                <CardTitle>{s.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-2 text-2xl font-semibold">{s.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-zinc-600">Monthly revenue chart placeholder.</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-zinc-600 space-y-2">
              <li>New signup — Acme Corp</li>
              <li>Generated image — user_102</li>
              <li>Payment processed — user_501</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
