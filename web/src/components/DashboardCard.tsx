export function DashboardCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl bg-white p-4 shadow dark:bg-gray-800"><h2 className="mb-2 font-semibold">{title}</h2>{children}</section>;
}
