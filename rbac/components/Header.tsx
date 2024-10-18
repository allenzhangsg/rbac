import { UserMenu } from "./UserMenu";
import Image from "next/image";

const Header = () => {
  return (
    <header className="border-b">
      <div className="container mx-auto py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Image src="/favicon.ico" alt="Logo" width={24} height={24} />
          <h1 className="text-2xl font-bold ml-2">RBAC Application</h1>
        </div>
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
