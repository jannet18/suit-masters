import type { ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/app/components/ui/card";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Centered card shell shared by the admin login/register pages. */
export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/30">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <span className="text-lg font-semibold tracking-tight">Suit Masters</span>
          <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase mt-0.5">
            Admin
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
          {footer && <CardFooter className="flex-col gap-3">{footer}</CardFooter>}
        </Card>
      </div>
    </div>
  );
}
