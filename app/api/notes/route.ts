// app/api/notes/route.ts
// Notes CRUD API via Neon Postgres
// Supports hierarchical folders and notes

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Ensure notes table exists
async function ensureTable() {
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('note', 'folder')),
    name TEXT NOT NULL,
    parent_id TEXT,
    content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}

export async function GET() {
  try {
    await ensureTable();
    const sql = getDb();
    const rows = await sql`
      SELECT id, type, name, parent_id, content, 
             EXTRACT(EPOCH FROM created_at) * 1000 AS created_at,
             EXTRACT(EPOCH FROM updated_at) * 1000 AS updated_at
      FROM notes 
      ORDER BY type DESC, name ASC
    `;
    const items = rows.map((row: any) => ({
      id: row.id,
      type: row.type,
      name: row.name,
      parentId: row.parent_id,
      content: row.content,
      createdAt: Number(row.created_at),
      updatedAt: Number(row.updated_at),
    }));
    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "db error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.id || !body?.name || !body?.type) {
      return NextResponse.json({ ok: false, error: "id, name, and type required" }, { status: 400 });
    }

    await ensureTable();
    const sql = getDb();
    
    const createdAt = body.createdAt ? new Date(body.createdAt) : new Date();
    const updatedAt = body.updatedAt ? new Date(body.updatedAt) : new Date();
    
    await sql`
      INSERT INTO notes (id, type, name, parent_id, content, created_at, updated_at)
      VALUES (
        ${body.id}, 
        ${body.type}, 
        ${body.name}, 
        ${body.parentId || null}, 
        ${body.content || null},
        ${createdAt.toISOString()},
        ${updatedAt.toISOString()}
      )
      ON CONFLICT (id) DO NOTHING
    `;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "db error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body?.id) {
      return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
    }

    await ensureTable();
    const sql = getDb();
    
    const updatedAt = new Date();
    
    await sql`
      UPDATE notes 
      SET 
        name = COALESCE(${body.name}, name),
        content = COALESCE(${body.content}, content),
        parent_id = ${body.parentId !== undefined ? body.parentId : sql`parent_id`},
        updated_at = ${updatedAt.toISOString()}
      WHERE id = ${body.id}
    `;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "db error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
    
    await ensureTable();
    const sql = getDb();
    
    // Delete recursively: first find all children
    const children = await sql`
      WITH RECURSIVE children AS (
        SELECT id FROM notes WHERE id = ${id}
        UNION ALL
        SELECT n.id FROM notes n 
        INNER JOIN children c ON n.parent_id = c.id
      )
      SELECT id FROM children
    `;
    
    const idsToDelete = children.map((row: any) => row.id);
    
    if (idsToDelete.length > 0) {
      await sql`DELETE FROM notes WHERE id = ANY(${idsToDelete})`;
    }
    
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "db error" }, { status: 500 });
  }
}
