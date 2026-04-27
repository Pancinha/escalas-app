"use client";

import { useSession } from "next-auth/react";
import { getInitials, roleName } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Header({ title, description, actions }: HeaderProps) {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role ?? "VIEWER";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>

      <div className="flex items-center gap-3">
        {actions}

        <div className="flex items-center gap-2.5 pl-3" style={{ borderLeft: "1px solid #e5e7eb" }}>
          <Avatar className="h-8 w-8">
            <AvatarFallback
              className="text-xs font-semibold text-white"
              style={{ backgroundColor: "#07104B" }}
            >
              {getInitials(session?.user?.name ?? "U")}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-tight">{session?.user?.name}</p>
            <p className="text-[11px] text-gray-500 leading-tight">{roleName(role)}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
