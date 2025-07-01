"use client";

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Stethoscope, User } from 'lucide-react';
import useFetch from '@/hooks/use-fetch';
import { setUserRole } from '@/actions/onboarding';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { SPECIALTIES } from '@/lib/specialities';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Link from 'next/link';

const doctorFormSchema = z.object({
  speciality:z.string().min(1, "speciality is required"),
  experience: z
    .number()
    .min(1, "Experience must be at least 1 year")
    .max(70, "Experience must be less than 70 years"),
  credentialUrl: z
    .string()
    .url("Please enter a valid URL")
    .min(1, "Credential URL is required"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description cannot exceed 1000 characters")
});

const Onboardingpage = () => {
  const [step, setStep] = useState("choose-role");
  const router = useRouter();

  const { data, fn: submitUserRole, loading } = useFetch(setUserRole);

  const { 
    register, 
    handleSubmit, 
    formState:{errors},
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(doctorFormSchema),
    defaultValues:{
      speciality:"",
      experience: undefined,
      CredentialUrl:"",
      description:"",
    },
  });

  const specialityValue = watch("speciality");

  const onDoctorSubmit= async(data)=>{
    if(loading) return;
    const formData = new FormData();
    formData.append("role", "DOCTOR");
    formData.append("speciality", data.speciality);
    formData.append("experience", data.experience.toString());
    formData.append("credentialUrl", data.credentialUrl);
    formData.append("description", data.description);

    await submitUserRole(formData);
  }

  if(step === "choose-role") {
    return (
      <>
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl mb-2 gradient-title">Welcome to MediMeet</h1>
          <p className="text-muted-foreground text-lg">Tell us how you want to use the platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-emerald-900/20 hover:border-emerald-700/40 cursor-pointer transition-all">
            <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
              <div className="p-4 bg-emerald-900/20 rounded-full mb-4">
                <User className="h-8 w-8 text-emerald-400"/>
              </div>
              <CardTitle className="text-xl font-semibold text-white mb-2">Join as a Patient</CardTitle>
              <CardDescription className="mb-4">Book appointments, consult with doctors, and manage your healthcare journey</CardDescription>
              <Link href="/">
                <Button className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700">
                  Continue as a Patient
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card onClick={() => !loading && setStep("doctor-form")} className="border-emerald-900/20 hover:border-emerald-700/40 cursor-pointer transition-all">
            <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
              <div className="p-4 bg-emerald-900/20 rounded-full mb-4">
                <Stethoscope className="h-8 w-8 text-emerald-400"/>
              </div>
              <CardTitle className="text-xl font-semibold text-white mb-2">Join as a Doctor</CardTitle>
              <CardDescription className="mb-4">Create your professional profile, set your availability, and provide consultations</CardDescription>
              <Button disabled={loading} className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700">
                Continue as a Doctor
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if(step === "doctor-form") {
    return (
      <Card className="border-emerald-900/20">
        <CardContent className="pt-6">
          <div className='mb-6'>
            <CardTitle className="text-2xl font-bold text-white mb-2">Complete your Doctor Profile</CardTitle>
            <CardDescription>Please provide your details for verification</CardDescription>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onDoctorSubmit)}>
            {/* Speciality */}
            <div className="space-y-2">
              <Label htmlFor="speciality" className="text-white">Medical Speciality</Label>
              <Select value={specialityValue} onValueChange={(value)=> setValue("speciality", value)}>
                <SelectTrigger id="speciality" className="w-1/3 border border-gray-600 bg-transparent text-white rounded-md px-3 py-2 text-sm">
                  <SelectValue placeholder="Select your speciality" />
                </SelectTrigger>
                <SelectContent className="w-full bg-[#0f0f0f] border border-gray-700 rounded-md text-white shadow-md p-1" side="top" align="start" sideOffset={0}>
                  {SPECIALTIES.map((spec) => (
                    <SelectItem key={spec.name} value={spec.name}>
                      <div className="flex items-center gap-2 text-white hover:bg-emerald-900/20 cursor-pointer px-3 py-2">
                        <span className="text-emerald-400">{spec.icon}</span>
                        {spec.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.speciality && <p className='text-sm font-medium text-red-500 mt-1'>{errors.speciality.message}</p>}
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-white">Years of Experience</Label>
              <Input id="experience" type="number" placeholder="eg. 5" {...register("experience", { valueAsNumber: true })} />
              {errors.experience && <p className='text-sm font-medium text-red-500 mt-1'>{errors.experience.message}</p>}
            </div>

            {/* Credential URL */}
            <div className="space-y-2">
              <Label htmlFor="credentialUrl" className="text-white">Link to Credential Document</Label>
              <Input id="credentialUrl" type="url" placeholder="https://example.com/my-medical-degree.pdf" {...register("credentialUrl")} />
              {errors.credentialUrl && <p className='text-sm font-medium text-red-500 mt-1'>{errors.credentialUrl.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description of Your services</Label>
              <Textarea id="description" placeholder="Describe your expertise, services, and approach to patient care.." rows="4" {...register("description")} />
              {errors.description && <p className='text-sm font-medium text-red-500 mt-1'>{errors.description.message}</p>}
            </div>

            {/* Buttons */}
            <div className='pt-2 flex items-center justify-between'>
              <Button type="button" variant="outline" onClick={()=> setStep("choose-role")} className="border-emerald-900/30" disabled={loading}>Back</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>  
                    Submitting...
                  </>
                ) : "Submit for Verification"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return <div>Onboardingpage</div>;
};

export default Onboardingpage;
