"use client";

import { SignIn } from "@clerk/nextjs";
import React from "react";

function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      {/* <h1></h1> */}
      <SignIn
        signUpUrl={`/signup${
          typeof window !== "undefined" ? window.location.search : ""
        }`}
      />
    </div>
  );
}

export default Page;
