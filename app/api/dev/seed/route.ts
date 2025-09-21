import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isServiceRoleAvailable } from '@/lib/env';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    if (!isServiceRoleAvailable()) {
      return NextResponse.json(
        { error: 'Service role key not available' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not available' },
        { status: 500 }
      );
    }

    // Check if database is already seeded
    const { data: existingUsers, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1);

    if (userCheckError) {
      return NextResponse.json(
        { error: 'Failed to check existing data', details: userCheckError.message },
        { status: 500 }
      );
    }

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Database already contains data. Clear existing data first.' },
        { status: 400 }
      );
    }

    // Run the seed script
    const { spawn } = require('child_process');
    
    return new Promise<Response>((resolve) => {
      const seedProcess = spawn('node', ['scripts/seed.js'], {
        stdio: 'pipe',
        env: { ...process.env }
      });

      let output = '';
      let errorOutput = '';

      seedProcess.stdout.on('data', (data: { toString: () => string; }) => {
        output += data.toString();
      });

      seedProcess.stderr.on('data', (data: { toString: () => string; }) => {
        errorOutput += data.toString();
      });

      seedProcess.on('close', (code: number) => {
        if (code === 0) {
          resolve(NextResponse.json({ 
            success: true, 
            message: 'Database seeded successfully',
            output: output.trim()
          }));
        } else {
          resolve(NextResponse.json(
            { 
              error: 'Seed script failed', 
              details: errorOutput.trim(),
              output: output.trim()
            },
            { status: 500 }
          ));
        }
      });
    });

  } catch (error) {
    console.error('Seed API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
