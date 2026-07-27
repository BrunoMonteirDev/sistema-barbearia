import { NextRequest, NextResponse } from 'next/server'
import { errorResponse, pageParams, unknownErrorResponse } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { clienteData, listClientes } from '@/services/cliente.service'

export async function GET(request: NextRequest) { try { const { page, pageSize, skip, search } = pageParams(request.url); const order = new URL(request.url).searchParams.get('order') === 'createdAt' ? 'createdAt' : 'nome'; const result = await listClientes(search, skip, pageSize, order); return NextResponse.json({ ...result, page, pageSize }) } catch (error) { return unknownErrorResponse(error) } }
export async function POST(request: NextRequest) { try { return NextResponse.json(await prisma.usuario.create({ data: clienteData(await request.json()) }), { status: 201 }) } catch (error) { return error instanceof Error ? errorResponse(error.message) : unknownErrorResponse(error) } }
