export default async function POST(request: Request) {
  try {
    console.log(await request.json())

    return Response.json({
      status: "OK"
    })
  } catch (error) {
    return Response.error()
  }
}