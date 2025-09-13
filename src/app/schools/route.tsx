import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { uploadImage } from '@/app/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const contact = formData.get('contact') as string;
    const email_id = formData.get('email_id') as string;
    const imageFile = formData.get('image') as File;

    // Upload image to Cloudinary
    const imageUrl = await uploadImage(imageFile);

    // Insert into database
    const insertQuery = `
      INSERT INTO schools (name, address, city, state, contact, image, email_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
   await query(insertQuery, [
  name ?? '',
  address ?? '',
  city ?? '',
  state ?? '',
  contact ?? '',
  imageUrl ?? '', // empty string if no image
  email_id ?? '',
]);

    return NextResponse.json(
      { message: 'School added successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding school:', error);
    return NextResponse.json(
      { error: 'Failed to add school' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const schools = await query(`
      SELECT id, name, address, city, image 
      FROM schools 
      
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