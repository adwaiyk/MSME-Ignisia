// Location: app/underwriting/layout.tsx
import SharedLayout from "@/components/SharedLayout";

export default function UnderwritingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SharedLayout>{children}</SharedLayout>;
}