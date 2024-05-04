export function GET() {
  return Response.json({ status: "OK! send employee data with POST method" })
}

export async function POST(request: Request) {
  console.log(await request.json())

  return Response.json({
    status: "OK"
  })
}