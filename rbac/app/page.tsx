"use client";

import { Card } from "@/components/ui/card";
import { UserList } from "@/components/UserList";
import { AddUserModal } from "@/components/AddUserModal";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto my-8 flex">
      <nav className="w-64 pr-7">
        <Card>
          <h3 className="p-4 font-semibold text-lg">Actions</h3>
          <div className="px-4 pb-4">
            <AddUserModal />
          </div>
        </Card>
        <Card className="mt-4">
          <h3 className="p-4 font-semibold text-lg">Resources</h3>
          <ul className="px-4 pb-4">
            <li>
              <Link href="/protected" className="text-blue-600 hover:underline">
                Protected Route
              </Link>
            </li>
          </ul>
        </Card>
      </nav>

      <div className="flex-grow">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Welcome to RBAC Application
          </h2>
          <p className="mb-4">
            This application demonstrates Role-Based Access Control (RBAC)
            functionality.
          </p>
          <UserList />
        </Card>
      </div>
    </div>
  );
}
