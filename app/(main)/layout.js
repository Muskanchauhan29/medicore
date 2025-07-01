import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import React from "react";

export const metadata = {
  title: "Onboarding - MediMeet",
  description: "Complete your profile to get started with MediMeet",
};

const Onboarding = async ({ children }) => {
  const user = await getCurrentUser();

  if (user) {
    if (user.role === "PATIENT") {
      return redirect("/doctor");
    } else if (user.role === "DOCTOR") {
      if (user.verificationsStatus === "VERIFIED") {
        return redirect("/doctors");
      } else {
        return redirect("/doctor/verification");
      }
    } else if (user.role === "ADMIN") {
      return redirect("/admin");
    }
  }

  // ✅ Just return the container and children — no heading here
  return (
    <div className="container mx-auto px-4 py-27">
      <div className="max-w-3xl mx-auto">
        {children}
      </div>
    </div>
  );
};

export default Onboarding;
