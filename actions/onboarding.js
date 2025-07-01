"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Sets the user's role and profile details (if Doctor)
 */
export async function setUserRole(formData) {
  const { userId } = await auth(); // ✅ Must await

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const role = formData.get("role");

  if (!role || !["PATIENT", "DOCTOR"].includes(role)) {
    return { success: false, error: "Invalid role selection" };
  }

  // Check if user exists in DB
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    return { success: false, error: "User not found in database" };
  }

  try {
    // PATIENT case
    if (role === "PATIENT") {
      await db.user.update({
        where: { clerkUserId: userId },
        data: { role: "PATIENT" },
      });

      revalidatePath("/");
      return { success: true, redirect: "/doctors" };
    }

    // DOCTOR case
    if (role === "DOCTOR") {
      const speciality = formData.get("speciality");
      const experience = parseInt(formData.get("experience"), 10);
      const credentialUrl = formData.get("credentialUrl");
      const description = formData.get("description");

      if (!speciality || !experience || !credentialUrl || !description) {
        return { success: false, error: "All doctor fields are required" };
      }

      await db.user.update({
        where: { clerkUserId: userId },
        data: {
          role: "DOCTOR",
          speciality,
          experience,
          credentialUrl,
          description,
          verificationStatus: "PENDING",
        },
      });

      revalidatePath("/");
      return { success: true, redirect: "/doctor/verification" };
    }
  } catch (error) {
    console.error("Failed to set role:", error);
    return { success: false, error: "Internal server error" };
  }
}

/**
 * Gets the current user's full profile from DB
 */
export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
}
