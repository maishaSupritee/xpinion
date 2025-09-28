import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Login() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-2">
      <Card className="w-full max-w-md p-8">
        <CardHeader>
          <CardTitle className="text-2xl">Log In</CardTitle>
          <CardDescription className="mt-2">
            Welcome back to Xpinion! Your XP journey continues here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="font-base">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="email@example.com"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="font-base">
                Password
              </Label>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="password"
              />
            </div>
            <Button type="submit" className="mt-4">
              Log In
            </Button>
          </form>
          <CardFooter className="mt-4 flex flex-col text-center">
            <p className="text-muted-foreground text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
}
