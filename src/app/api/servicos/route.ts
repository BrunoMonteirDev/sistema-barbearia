import { NextRequest, NextResponse } from 'next/server'
import { errorResponse, pageParams, unknownErrorResponse } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { listServicos, servicoData } from '@/services/servico.service'

export async function GET(request: NextRequest) { try { const { page, pageSize, skip, search } = pageParams(request.url); const result = await listServicos(search, skip, pageSize); return NextResponse.json({ ...result, page, pageSize }) } catch (error) { return unknownErrorResponse(error) } }
export async function POST(request: NextRequest) { try { return NextResponse.json(await prisma.servico.create({ data: servicoData(await request.json()) }), { status: 201 }) } catch (error) { return error instanceof Error ? errorResponse(error.message) : unknownErrorResponse(error) } }
