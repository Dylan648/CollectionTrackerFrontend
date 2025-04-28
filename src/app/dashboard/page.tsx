"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to Your Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your media collections</p>
          </div>
          <Button asChild>
            <Link href="/collection">View Collection</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add dashboard widgets or content here */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            <p className="text-gray-600 dark:text-gray-400">Coming soon...</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <p className="text-gray-600 dark:text-gray-400">Coming soon...</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
            <p className="text-gray-600 dark:text-gray-400">Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
} 