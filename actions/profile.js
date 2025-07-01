'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Image from 'next/image';

const ProfilePage = () => {
  const { user } = useUser();
  const { user: clerkUser, updateUser } = useClerk();
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    age: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.fullName || '',
        bio: user.publicMetadata.bio || '',
        age: user.publicMetadata.age || '',
        phone: user.phoneNumbers?.[0]?.phoneNumber || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await clerkUser.update({
        fullName: profile.name,
        publicMetadata: {
          bio: profile.bio,
          age: profile.age,
        },
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <Card className="border-emerald-900/30">
        <CardContent className="space-y-6 pt-6">
          <CardTitle className="text-2xl font-bold text-white mb-2">My Profile</CardTitle>

          {/* Profile Photo */}
          <div className="flex items-center gap-4">
            <Image
              src={user?.imageUrl || '/default-avatar.png'}
              alt="Profile"
              width={60}
              height={60}
              className="rounded-full border border-emerald-800"
            />
            <Button
              variant="outline"
              onClick={() => clerkUser?.profileImage?.set()}
            >
              Change Photo
            </Button>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <Label className="text-white">Full Name</Label>
            <Input
              name="name"
              value={profile.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <Label className="text-white">Bio</Label>
            <Textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          {/* Age */}
          <div className="space-y-1">
            <Label className="text-white">Age</Label>
            <Input
              type="number"
              name="age"
              value={profile.age}
              onChange={handleChange}
              placeholder="Enter your age"
            />
          </div>

          {/* Phone (Read Only) */}
          {profile.phone && (
            <div className="space-y-1">
              <Label className="text-white">Phone Number</Label>
              <Input value={profile.phone} readOnly disabled />
            </div>
          )}

          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
