import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../lib/db';
import { uploadImage } from '../../lib/cloudinary';
import { getUserFromToken } from '../../lib/auth';

// Helper function to check authentication
async function checkAuth(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }
  
  return await getUserFromToken(token);
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const userId = await checkAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in to add schools.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const contact = formData.get('contact') as string;
    const email_id = formData.get('email_id') as string;
    const imageFile = formData.get('image') as File;

    // Validate required fields
    if (!name || !address || !city || !state || !contact || !email_id || !imageFile) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Upload image to Cloudinary
    const imageUrl = await uploadImage(imageFile);

    // Insert into database
    const insertQuery = `
      INSERT INTO schools (name, address, city, state, contact, image, email_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await query(insertQuery, [
      name,
      address,
      city,
      state,
      contact,
      imageUrl,
      email_id,
    ]);

    return NextResponse.json(
      { message: 'School added successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding school:', error);
    return NextResponse.json(
      { error: 'Failed to add school. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const schools = await query(`
      SELECT id, name, address, city, image 
      FROM schools 
      ORDER BY created_at DESC
    `);
    
    return NextResponse.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schools' },
      { status: 500 }
    );
  }
}