// UTILS
import { api } from "@/trpc/server";
// UI
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";

export default async function UserInfo() {
  const employeeData = await api.employeeRouter.getData();
  const { employee, designation } = employeeData!;

  const avatarUrl =
    employee.imageUrl ??
    `https://api.dicebear.com/8.x/avataaars/svg?seed=${employee.name}&backgroundColor=c0aede,d1d4f9,ffd5dc,ffdfbf&accessories=prescription01,prescription02,round,sunglasses&clothing=blazerAndSweater,collarAndSweater,graphicShirt,hoodie,overall,shirtCrewNeck,shirtScoopNeck,shirtVNeck,blazerAndShirt&eyebrows=default,defaultNatural,flatNatural,raisedExcited,raisedExcitedNatural,unibrowNatural,upDown,upDownNatural&eyes=default,happy,surprised&facialHair[]&mouth=default,smile&top=bigHair,bun,curly,curvy,dreads,dreads01,dreads02,frida,frizzle,fro,froBand,hat,longButNotTooLong,miaWallace,shaggy,shaggyMullet,shavedSides,shortCurly,shortFlat,shortRound,shortWaved,sides,straight01,straight02,straightAndStrand,theCaesar,theCaesarAndSidePart,turban,winterHat02,winterHat03,winterHat04,winterHat1`;

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-14 w-14">
        <AvatarImage src={avatarUrl} alt={employee.name} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <p className="flex flex-col items-start gap-0.5">
        <span className="text-lg font-medium">{employee.name}</span>
        <span className="rounded-full bg-primary p-1 px-2 text-xs text-white">
          {designation.name}
        </span>
      </p>
    </div>
  );
}
