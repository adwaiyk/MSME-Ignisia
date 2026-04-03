import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    // 1. Get the absolute path to your data folder
    const dataDir = path.join(process.cwd(), 'data');

    // 2. Read the CSV files
    const onboardingCsv = fs.readFileSync(path.join(dataDir, 'onboarding_data.csv'), 'utf8');
    
    // 3. Parse the CSV into JSON
    const parsedOnboarding = Papa.parse(onboardingCsv, {
      header: true,
      dynamicTyping: true, // Automatically converts numbers/booleans
      skipEmptyLines: true,
    });

    // 4. Return the data as a JSON API response
    return NextResponse.json({
      success: true,
      msme_profiles: parsedOnboarding.data
    }, { status: 200 });

  } catch (error) {
    console.error("Error reading mock data:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch MSME data" }, { status: 500 });
  }
}