import { PaymentsHeader, PaymentsShell } from "./shell";

export default function PaymentsLoading() {
  return (
    <div className="space-y-6">
      <PaymentsHeader />
      <PaymentsShell />
    </div>
  );
}
