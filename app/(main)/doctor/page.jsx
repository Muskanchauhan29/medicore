import {
  getDoctorAppointments,
  getDoctorAvailability,
} from "@/actions/doctor";
import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"; // <- using shadcn/ui style
import { AlertCircle, Clock, CreditCard } from "lucide-react";

export const metadata = {
  title: "Doctor Dashboard - MediMeet",
  description: "Manage your appointments and availability",
};

const DoctorDashboard = async () => {
  const user = await getCurrentUser();

  // ✅ Check if user is not a doctor → redirect
  if (user?.role !== "DOCTOR") {
    redirect("/onboarding");
  }

  // ✅ Check if doctor is not verified → redirect
  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/doctor/verification");
  }

  // ✅ Now safe to fetch data
  const [appointmentsData, availabilityData] = await Promise.all([
    getDoctorAppointments(),
    getDoctorAvailability(),
  ]);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Doctor Dashboard</h1>

      <Tabs defaultValue="appointments" className="grid md:grid-cols-4 gap-6">
        <TabsList className="md:col-span-1 bg-muted/30 border h-fit flex flex-col p-2 rounded-md space-y-2">
          <TabsTrigger value="appointments" className="flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Availability
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Payouts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="md:col-span-3">
          <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
          {appointmentsData?.appointments?.length === 0 ? (
            <p className="text-gray-500">No upcoming appointments.</p>
          ) : (
            <ul className="space-y-4">
              {appointmentsData.appointments.map((appt) => (
                <li
                  key={appt.id}
                  className="p-4 border rounded-md shadow-sm bg-white"
                >
                  <p>
                    <strong>Patient:</strong>{" "}
                    {appt.patient?.name || "Unknown"}
                  </p>
                  <p>
                    <strong>Start:</strong>{" "}
                    {new Date(appt.startTime).toLocaleString()}
                  </p>
                  <p>
                    <strong>End:</strong>{" "}
                    {new Date(appt.endTime).toLocaleString()}
                  </p>
                  <p>
                    <strong>Status:</strong> {appt.status}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="availability" className="md:col-span-3">
          <h2 className="text-xl font-semibold mb-4">Availability Slots</h2>
          {availabilityData?.slots?.length === 0 ? (
            <p className="text-gray-500">No availability set.</p>
          ) : (
            <ul className="space-y-4">
              {availabilityData.slots.map((slot) => (
                <li
                  key={slot.id}
                  className="p-4 border rounded-md shadow-sm bg-white"
                >
                  <p>
                    <strong>From:</strong>{" "}
                    {new Date(slot.startTime).toLocaleString()}
                  </p>
                  <p>
                    <strong>To:</strong>{" "}
                    {new Date(slot.endTime).toLocaleString()}
                  </p>
                  <p>
                    <strong>Status:</strong> {slot.status}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="payouts" className="md:col-span-3">
          <h2 className="text-xl font-semibold mb-4">Payouts</h2>
          <p className="text-gray-500">Payout data coming soon.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorDashboard;
