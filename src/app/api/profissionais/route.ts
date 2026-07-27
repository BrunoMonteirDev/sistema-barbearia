import { NextRequest, NextResponse } from 'next/server'
import { errorResponse, pageParams, unknownErrorResponse } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { listProfissionais, profissionalData } from '@/services/profissional.service'

export async function GET(request: NextRequest) {
  try { const { page, pageSize, skip, search } = pageParams(request.url); const result = await listProfissionais(search, skip, pageSize); return NextResponse.json({ ...result, page, pageSize }) } catch (error) { return unknownErrorResponse(error) }
}
export async function POST(request: NextRequest) {
  try { return NextResponse.json(await prisma.profissional.create({ data: profissionalData(await request.json()) }), { status: 201 }) } catch (error) { return error instanceof Error ? errorResponse(error.message) : unknownErrorResponse(error) }
}
