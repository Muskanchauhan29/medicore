'use server'
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

const PLAN_CREDITS = {
  free_user: 0, // Basic plan: 2 credits
  standard: 10, // Standard plan: 10 credits per month
  premium: 24, // Premium plan: 24 credits per month
};

// Each appointment costs 2 credits
const APPOINTMENT_CREDIT_COST = 2;

/**
 * Checks user's subscription and allocates monthly credits if needed
 * This should be called on app initialization (e.g., in a layout component)
 */
export async function checkAndAllocateCredits(user) {
  try {
    if (!user) {
      return null;
    }

    // Only allocate credits for patients
    if (user.role !== "PATIENT") {
      return user;
    }

    // Check if user has a subscription
    const { has } = await auth();

    // Check which plan the user has
    const hasBasic = has({ plan: "free_user" });
    const hasStandard = has({ plan: "standard" });
    const hasPremium = has({ plan: "premium" });

    let currentPlan = null;
    let creditsToAllocate = 0;

    if (hasPremium) {
      currentPlan = "premium";
      creditsToAllocate = PLAN_CREDITS.premium;
    } else if (hasStandard) {
      currentPlan = "standard";
      creditsToAllocate = PLAN_CREDITS.standard;
    } else if (hasBasic) {
      currentPlan = "free_user";
      creditsToAllocate = PLAN_CREDITS.free_user;
    }

    if(!currentPlan){
        return user;
    }
    const currentMonth = format(new Date(), "yyyy-MM")
    if(user.transactions.length > 0){
         const latestTransaction = user.transactions[0];
         const transactionMonth = format(
            new Date(latestTransaction.createdAt),
            "yyyy-MM"
         );
         const transactionPlan = latestTransaction.packageId;

         if(
            transactionMonth === currentMonth &&
            transactionPlan === currentPlan
         ) {
            return user;
         }
    }

    const updatedUser = await db.$transaction(async(tx)=>{
        await tx.creditTransaction.create({
           data:{

            userId: user.id,
            amount: creditsToAllocate,
            type: "CREDIT_PURCHASE",
            packageId: currentPlan,
        },
    });

        const updateUser = await tx.user.update({
            where:{
                id: user.id,
            },
            data:{
                credits:{
                    increment: creditsToAllocate,
                },
            },
        });
        return updatedUser;
    });

    revalidatePath("/doctors");
    revalidatePath("/appointments");

    return updatedUser;
  }catch (error){
    console.error(
        "failed to check subscription and allocate credits:",
        error.message
    );
        return null;
  }
} 