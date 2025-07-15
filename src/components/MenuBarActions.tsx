import React from "react";
import { DASHBOARD_ACTIONS, Role } from "@/config/roles";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "@/components/ui/menubar";

interface MenuBarActionsProps {
  user: { role: string };
  handleLogout: () => void;
  navigate: (route: string) => void;
}

const MenuBarActions: React.FC<MenuBarActionsProps> = ({
  user,
  handleLogout,
  navigate,
}) => {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger className="bg-transparent text-white border border-white">
          Menu
        </MenubarTrigger>
        <MenubarContent>
          {DASHBOARD_ACTIONS.filter((action) =>
            action.roles.includes(user.role as Role)
          ).map((action) => {
            const Icon = action.icon;
            return (
              <MenubarItem
                key={action.key}
                className={action.colorClass + " flex gap-2 items-center"}
                onClick={() =>
                  action.key === "logout"
                    ? handleLogout()
                    : navigate(action.route)
                }
              >
                <Icon className="w-4 h-4" />
                {action.label}
              </MenubarItem>
            );
          })}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};

export default MenuBarActions;
