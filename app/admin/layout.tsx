import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — MotorStock",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
