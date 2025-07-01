import { NextResponse } from 'next/server';
// app/api/user/route.js
import { checkUser } from '@/lib/checkUser';

export async function GET() {
  const user = await checkUser();
  return Response.json(user);

}
