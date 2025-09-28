import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignUp() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-2">
      <Card className="w-full max-w-md p-8">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription className="mt-2">
            Share your opinions to stack up your XP!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username" className="font-base">
                Username
              </Label>
              <Input
                type="text"
                id="username"
                name="username"
                placeholder="username"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="font-base">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="email@example.com"
                required
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
                required
              />
            </div>
            <Button type="submit" className="mt-4">
              Sign Up
            </Button>
          </form>
          <CardFooter className="mt-4 flex flex-col text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log In
              </Link>
            </p>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
}
