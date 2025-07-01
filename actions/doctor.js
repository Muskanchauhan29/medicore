"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Get the currently authenticated doctor user from the database
 */
async function getDoctorUserOrThrow() {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const doctor = await db.user.findUnique({
    where: { clerkUserId: userId, role: "DOCTOR" },
  });

  if (!doctor) throw new Error("Doctor not found");

  return doctor;
}

/**
 * Set doctor's availability slots
 */
export async function setAvailabilitySlots(formData) {
  const doctor = await getDoctorUserOrThrow();

  const startTime = formData.get("startTime");
  const endTime = formData.get("endTime");

  if (!startTime || !endTime) {
    throw new Error("Start time and end time are required");
  }

  if (startTime >= endTime) {
    throw new Error("Start time must be before end time");
  }

  const existingSlots = await db.availability.findMany({
    where: { doctorId: doctor.id },
    include: { appointment: true },
  });

  const deletableSlots = existingSlots.filter(
    (slot) => !slot.appointment
  );

  if (deletableSlots.length > 0) {
    await db.availability.deleteMany({
      where: {
        id: { in: deletableSlots.map((slot) => slot.id) },
      },
    });
  }

  const newSlot = await db.availability.create({
    data: {
      doctorId: doctor.id,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: "AVAILABLE",
    },
  });

  revalidatePath("/doctor");

  return { success: true, slot: newSlot };
}

/**
 * Get current availability slots of a doctor
 */
export async function getDoctorAvailability() {
  const doctor = await getDoctorUserOrThrow();

  const slots = await db.availability.findMany({
    where: { doctorId: doctor.id },
    orderBy: { startTime: "asc" },
  });

  return { slots };
}

/**
 * Get upcoming appointments for a doctor
 */
export async function getDoctorAppointments() {
  const doctor = await getDoctorUserOrThrow();

  const appointments = await db.appointment.findMany({
    where: {
      doctorId: doctor.id,
      status: { in: ["SCHEDULED"] },
    },
    include: { patient: true },
    orderBy: { startTime: "asc" },
  });

  return { appointments };
}

/**
 * Cancel an appointment (by doctor or patient)
 */
export async function cancelAppointment(formData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const appointmentId = formData.get("appointmentId");
  if (!appointmentId) throw new Error("Appointment ID is required");

  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: { doctor: true, patient: true },
  });

  if (!appointment) throw new Error("Appointment not found");
  if (
    appointment.doctorId !== user.id &&
    appointment.patientId !== user.id
  ) {
    throw new Error("Not authorized to cancel this appointment");
  }

  await db.$transaction(async (tx) => {
    await tx.appointment.update({
      where: { id: appointmentId },
      data: { status: "CANCELLED" },
    });

    await tx.creditTransaction.createMany({
      data: [
        {
          userId: appointment.patientId,
          amount: 2,
          type: "APPOINTMENT_DEDUCTION",
        },
        {
          userId: appointment.doctorId,
          amount: -2,
          type: "APPOINTMENT_DEDUCTION",
        },
      ],
    });

    await tx.user.update({
      where: { id: appointment.patientId },
      data: { credits: { increment: 2 } },
    });

    await tx.user.update({
      where: { id: appointment.doctorId },
      data: { credits: { decrement: 2 } },
    });
  });

  revalidatePath(user.role === "DOCTOR" ? "/doctor" : "/appointments");

  return { success: true };
}

/**
 * Add notes to an appointment
 */
export async function addAppointmentNotes(formData) {
  const doctor = await getDoctorUserOrThrow();

  const appointmentId = formData.get("appointmentId");
  const notes = formData.get("notes");

  if (!appointmentId || !notes) {
    throw new Error("Appointment ID and notes are required");
  }

  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId, doctorId: doctor.id },
  });

  if (!appointment) throw new Error("Appointment not found");

  const updated = await db.appointment.update({
    where: { id: appointmentId },
    data: { notes },
  });

  revalidatePath("/doctor");

  return { success: true, appointment: updated };
}

/**
 * Mark an appointment as completed
 */
export async function markAppointmentCompleted(formData) {
  const doctor = await getDoctorUserOrThrow();

  const appointmentId = formData.get("appointmentId");
  if (!appointmentId) throw new Error("Appointment ID is required");

  const appointment = await db.appointment.findUnique({
    where: {
      id: appointmentId,
      doctorId: doctor.id,
    },
    include: { patient: true },
  });

  if (!appointment) {
    throw new Error("Appointment not found or unauthorized");
  }

  if (appointment.status !== "SCHEDULED") {
    throw new Error("Only scheduled appointments can be completed");
  }

  const now = new Date();
  const endTime = new Date(appointment.endTime);
  if (now < endTime) {
    throw new Error("Cannot mark appointment completed before end time");
  }

  const updated = await db.appointment.update({
    where: { id: appointmentId },
    data: { status: "COMPLETED" },
  });

  revalidatePath("/doctor");

  return { success: true, appointment: updated };
}
