"use client";

import React, { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setUserRole } from "@/lib/clerk";
// import { clerkClient } from "@clerk/nextjs/server";

// shadcn imports
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Eye, EyeOff } from "lucide-react";

function Signup() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) {
      return (
        <div className="flex flex-col gap-6 justify-center items-center min-h-screen">
          <h1>Loading...</h1>
          <Progress value={33} />
        </div>
      );
    }

    // validate all fields
    if (!emailAddress || !password || !firstName || !lastName || !role) {
      setError("all fields are required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // sign-up
      await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
      });

      // send code to email
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      const url = new URL(window.location.href);
      const redirectParam = url.searchParams.get("redirect_url");
      const justSignedUp = url.searchParams.get("justSignedUp");

      if (redirectParam && !justSignedUp) {
        // this is imp. dont remove. this helps for the later on updation of roles in clerk and neondb.
        router.push(`/signup?redirect_url=${redirectParam}&justSignedUp=true`);
      } else if (!justSignedUp) {
        // this is imp. dont remove. this helps for the later on updation of roles in clerk and neondb.
        router.push("/signup?justSignedUp=true");
      }

      // // this is imp. dont remove. this helps for the later on updation of roles in clerk and neondb.
      // router.push("/signup?justSignedUp=true");
      setPendingVerification(true);
      setLoading(false);

      // now next input box for code input.

      // // prompt user for a code
      // const userInputCode = prompt("check your email & enter the code");

      // if (!userInputCode) {
      //   throw new Error("no code entered");
      // }

      // // attempt to verify email with code
      // await signUp.attemptEmailAddressVerification({ code: userInputCode });

      // // activate the user
      // const completeSignUp = await signUp.activate();

      // // set role
      // await clerkClient.users.updateUser(completeSignUp.userId, {
      //   publicMetadata: {
      //     role: role,
      //   },
      // });

      // alert("signup successfull");
    } catch (error: unknown) {
      setLoading(false);
      console.error(error);

      if (error instanceof Error) {
        setError(error?.message);
      } else {
        setError("signup failed");
      }
    }
  };

  const onPressVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) {
      return (
        <div className="flex flex-col gap-6 justify-center items-center min-h-screen">
          <h1>Loading...</h1>
          <Progress value={66} />
        </div>
      );
    }

    setLoading(true);

    try {
      const completeSignup = await signUp.attemptEmailAddressVerification({
        code,
      });
      // options: 'missing_requirements' | 'complete' | 'abandoned';

      if (completeSignup.status !== "complete") {
        console.log(JSON.stringify(completeSignup.status, null, 2));
      }

      // verification done successfully
      if (completeSignup.status === "complete") {
        const userId = completeSignup.createdUserId;

        if (!userId) {
          throw new Error("user if not avaiable after signup");
        }

        // await (
        //   await clerkClient()
        // ).users.updateUser(userId, {
        //   publicMetadata: {
        //     role: role,
        //   },
        // });

        if (role === "VENDOR" || role === "CUSTOMER") {
          await setActive({ session: completeSignup.createdSessionId });

          await setUserRole(userId, role);

          // setTimeout(() => {
          //   console.log("waiting for role setup and shop creation");
          // }, 2000);

          const url = new URL(window.location.href);
          const redirectParam = url.searchParams.get("redirect_url");

          console.log("redirected path = ", redirectParam);

          // came from some shop. go back to that shop
          if (redirectParam) router.push(`/${redirectParam}`);
          else if (role === "CUSTOMER") router.push("/dashboard");
          else router.push("/admin/dashboard");
        } else {
          setError("invalid role");
          console.error("invalid role");
        }
      }
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof Error) {
        setError(error?.message);
      } else {
        setError("signup failed");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card>
        <CardHeader>
          <CardTitle>Sign Up for Vendor Vista</CardTitle>
          <CardDescription>A one stop for all the vendors</CardDescription>
        </CardHeader>
        <CardContent>
          {!pendingVerification ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="example@gmail.com"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-between items-center gap-2">
                <div className="space-y-2">
                  <Label htmlFor="fname">First Name</Label>
                  <Input
                    type="text"
                    id="fname"
                    placeholder="Arshpreet"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lname">Last Name</Label>
                  <Input
                    type="text"
                    id="lname"
                    placeholder="Singh"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              <Select value={role} onValueChange={(value) => setRole(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                  <SelectItem value="VENDOR">Vendor</SelectItem>
                </SelectContent>
              </Select>
              {error && (
                <Alert variant={"destructive"}>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {loading && (
                <div className="flex flex-col gap-6 justify-center items-center">
                  <h1>Loading...</h1>
                  <Progress value={33} />
                </div>
              )}
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
            </form>
          ) : (
            <form onSubmit={onPressVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter verification code"
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {loading && (
                <div className="flex flex-col gap-6 justify-center items-center">
                  <h1>Loading...</h1>
                  <Progress value={33} />
                </div>
              )}

              <Button type="submit" className="w-full">
                Verify Email
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?
            <Link
              href={`/signin${
                typeof window !== "undefined" ? window.location.search : ""
              }`}
              className="font-medium text-primary hover:underline ml-1"
            >
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Signup;
