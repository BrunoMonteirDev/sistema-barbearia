import { NextResponse } from 'next/server'

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function unknownErrorResponse(error: unknown) {
  console.error(error)
  return errorResponse('Não foi possível concluir a solicitação. Tente novamente.', 500)
}

export function pageParams(url: string) {
  const query = new URL(url).searchParams
  const page = Math.max(1, Number(query.get('page')) || 1)
  const pageSize = Math.min(50, Math.max(5, Number(query.get('pageSize')) || 10))
  return { page, pageSize, skip: (page - 1) * pageSize, search: query.get('search')?.trim() ?? '' }
}
