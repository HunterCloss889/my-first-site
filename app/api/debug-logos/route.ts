// app/api/debug-logos/route.ts
import { NextResponse } from "next/server";
import { openLogosDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await openLogosDb();
    
    // Get all tables
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    
    if (tables.length === 0) {
      return NextResponse.json({ error: "No tables found" }, { status: 404 });
    }
    
    const tableName = (tables[0] as any).name;
    
    // Get schema for the first table
    const schema = await db.all(`PRAGMA table_info(${tableName})`);
    
    // Get first row as sample
    const sampleRow = await db.get(`SELECT * FROM ${tableName} LIMIT 1`);
    
    // Get all rows
    const allRows = await db.all(`SELECT * FROM ${tableName} LIMIT 5`);
    
    return NextResponse.json({
      tables: tables,
      tableName,
      schema,
      sampleRow,
      allRows,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Internal server error", stack: err?.stack },
      { status: 500 },
    );
  }
}

