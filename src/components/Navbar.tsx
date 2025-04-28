"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, LogOut } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        router.push("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center">
              <Home className="h-5 w-5 mr-2" />
              <span className="font-semibold">Home</span>
            </Link>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {pathname === "/collection" && "Collection"}
              {pathname === "/review" && "Review"}
              {pathname === "/dashboard" && "Dashboard"}
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="flex items-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
} 