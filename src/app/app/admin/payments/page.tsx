import { PageHeader } from "@/components/dashboard/page-header";
import { DollarSign, TrendingUp, Download, CheckCircle2, XCircle, Clock } from "lucide-react";

const transactions = [
  { id: "TXN-001", student: "Muhammad Ali", plan: "Premium", amount: 60, method: "Stripe", date: "Jan 13, 2026", status: "success" },
  { id: "TXN-002", student: "Ahmed Hassan", plan: "Basic", amount: 30, method: "PayPal", date: "Jan 13, 2026", status: "success" },
  { id: "TXN-003", student: "Fatima Khan", plan: "Premium", amount: 60, method: "Stripe", date: "Jan 12, 2026", status: "success" },
  { id: "TXN-004", student: "Aisha Malik", plan: "Trial", amount: 0, method: "—", date: "Jan 12, 2026", status: "pending" },
  { id: "TXN-005", student: "Omar Sheikh", plan: "Premium", amount: 60, method: "Stripe", date: "Jan 11, 2026", status: "failed" },
];

const statusConfig = {
  success: { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-500/10" },
  pending: { icon: Clock, color: "text-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.1)]" },
  failed: { icon: XCircle, color: "text-destructive bg-destructive/10" },
};

export default function AdminPayments() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments & Transactions"
        description="Manage all financial transactions"
        action={
          <button className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-primary/40">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: "$24,580", trend: "+8.2%", icon: DollarSign, color: "from-primary to-accent" },
          { label: "This Month", value: "$3,420", trend: "+12.5%", icon: TrendingUp, color: "from-emerald-500 to-teal-500" },
          { label: "Pending Refunds", value: "$240", trend: "2 requests", icon: Clock, color: "from-[hsl(var(--gold))] to-amber-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${s.color} text-primary-foreground shadow-md`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-[11px] text-primary mt-2 font-medium">{s.trend}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/40">
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 font-semibold">Transaction</th>
                <th className="px-6 py-3 font-semibold">Student</th>
                <th className="px-6 py-3 font-semibold">Plan</th>
                <th className="px-6 py-3 font-semibold">Amount</th>
                <th className="px-6 py-3 font-semibold">Method</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((t) => {
                const cfg = statusConfig[t.status as keyof typeof statusConfig];
                return (
                  <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{t.id}</td>
                    <td className="px-6 py-4 text-sm font-semibold">{t.student}</td>
                    <td className="px-6 py-4 text-sm">{t.plan}</td>
                    <td className="px-6 py-4 text-sm font-bold">${t.amount}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{t.method}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{t.date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${cfg.color}`}>
                        <cfg.icon className="h-3 w-3" />
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </span>
                    </td>
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
