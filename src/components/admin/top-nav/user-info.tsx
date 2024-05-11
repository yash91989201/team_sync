// UTILS
import { api } from "@/trpc/server";
// UI
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";

export default async function UserInfo() {
  const admin = await api.adminRouter.getData();

  const avatarUrl =
    admin?.imageUrl ??
    `https://api.dicebear.com/8.x/avataaars/svg?seed=${admin?.name}&backgroundColor=c0aede,d1d4f9,ffd5dc,ffdfbf&accessories=prescription01,prescription02,round,sunglasses&clothing=blazerAndSweater,collarAndSweater,graphicShirt,hoodie,overall,shirtCrewNeck,shirtScoopNeck,shirtVNeck,blazerAndShirt&eyebrows=default,defaultNatural,flatNatural,raisedExcited,raisedExcitedNatural,unibrowNatural,upDown,upDownNatural&eyes=default,happy,surprised&facialHair[]&mouth=default,smile&top=bigHair,bun,curly,curvy,dreads,dreads01,dreads02,frida,frizzle,fro,froBand,hat,longButNotTooLong,miaWallace,shaggy,shaggyMullet,shavedSides,shortCurly,shortFlat,shortRound,shortWaved,sides,straight01,straight02,straightAndStrand,theCaesar,theCaesarAndSidePart,turban,winterHat02,winterHat03,winterHat04,winterHat1`;

  const nameInitials = admin?.name
    .split(" ")
    .filter((nameChunk) => nameChunk.charAt(0))
    .join("");

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-12 w-12">
        <AvatarImage src={avatarUrl} alt={admin?.name} />
        <AvatarFallback>{nameInitials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start gap-1">
        <p className="text-lg font-medium">{admin?.name}</p>
        <Badge>ADMIN</Badge>
      </div>
    </div>
  );
}
