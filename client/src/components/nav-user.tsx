import { IconLogout } from "@tabler/icons-react";
import { toSvg } from "jdenticon";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const getAvatarSrc = (username: string, size = 32) => {
  const svgString = toSvg(username || "Guest", size, {
    lightness: {
      grayscale: [0.1, 0.3],
      color: [0.1, 0.3],
    },
    saturation: {
      color: 0.3,
      grayscale: 0,
    },
    backColor: "#ffffff",
  });
  return `data:image/svg+xml;base64,${btoa(svgString)}`;
};

export function NavUser({
  user,
  onLogout,
}: {
  user: {
    name: string;
    email: string;
  };
  onLogout?: () => void;
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          size="lg"
        >
          <Avatar className="h-8 w-8 rounded-lg overflow-hidden">
            <AvatarImage
              alt={user.name}
              className="rounded-lg"
              src={getAvatarSrc(user.name, 32)}
            />
            <AvatarFallback className="rounded-lg">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span className="text-muted-foreground truncate text-xs">
              {user.email}
            </span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="ml-auto h-8 w-8 p-0 inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-md cursor-pointer"
                  onClick={onLogout}
                >
                  <IconLogout className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent>Logout</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
