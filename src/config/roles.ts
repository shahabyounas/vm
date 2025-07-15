// Role definitions and allowed dashboard actions
import { LucideIcon } from "lucide-react";

export type Role = "customer" | "admin" | "super_admin";

export interface DashboardAction {
  key: string;
  label: string;
  route: string;
  colorClass: string;
  roles: Role[];
  icon: LucideIcon;
}

import {
  ScanLine,
  Settings,
  Users,
  LogOut,
} from "lucide-react";

export const DASHBOARD_ACTIONS: DashboardAction[] = [
  {
    key: "scan",
    label: "Scan",
    route: "/scan",
    colorClass: "border-green-500 text-green-400 hover:bg-green-500 hover:text-white",
    roles: ["admin", "super_admin"],
    icon: ScanLine,
  },
  {
    key: "settings",
    label: "Settings",
    route: "/settings",
    colorClass: "border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white",
    roles: ["admin", "super_admin"],
    icon: Settings,
  },
  {
    key: "users",
    label: "Users",
    route: "/users",
    colorClass: "border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white",
    roles: ["super_admin"],
    icon: Users,
  },
  {
    key: "logout",
    label: "Logout",
    route: "logout",
    colorClass: "border-red-500 text-red-400 hover:bg-red-500 hover:text-white",
    roles: ["customer", "admin", "super_admin"],
    icon: LogOut,
  },
]; 