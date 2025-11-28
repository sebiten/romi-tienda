// components/Navbar.tsx (SERVER COMPONENT)

import NavbarClient from "./NavBarClient";


interface NavbarProps {
  user: any | null;
  isAdmin?: boolean;
}

export default function Navbar({ user, isAdmin }: NavbarProps) {
  return <NavbarClient user={user} isAdmin={isAdmin} />;
}
