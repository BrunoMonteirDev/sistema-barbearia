import { NextRequest, NextResponse } from 'next/server'
import { errorResponse, unknownErrorResponse } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { canDeleteProfissional, profissionalData } from '@/services/profissional.service'

type Context = { params: Promise<{ id: string }> }
export async function PUT(request: NextRequest, { params }: Context) { try { const { id } = await params; return NextResponse.json(await prisma.profissional.update({ where: { id }, data: profissionalData(await request.json()) })) } catch (error) { return error instanceof Error ? errorResponse(error.message) : unknownErrorResponse(error) } }
export async function DELETE(_request: NextRequest, { params }: Context) { try { const { id } = await params; if (!await canDeleteProfissional(id)) return errorResponse('Não é possível excluir este profissional porque existem agendamentos vinculados a ele.', 409); await prisma.profissional.delete({ where: { id } }); return NextResponse.json({ success: true }) } catch (error) { return unknownErrorResponse(error) } }
