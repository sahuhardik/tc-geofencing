import Logo from "@components/ui/logo";
import { useUI } from "@contexts/ui.context";
import AuthorizedMenu from "./authorized-menu";
import { NavbarIcon } from "@components/icons/navbar-icon";
import { motion } from "framer-motion";

const Navbar = () => {
  const { toggleSidebar } = useUI();

  return (
    <header className="bg-white shadow fixed w-full z-40">
      <nav className="px-5 md:px-8 py-4 flex items-center justify-between">
        {/* <!-- Mobile menu button --> */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={toggleSidebar}
          className="flex p-2 h-full items-center justify-center focus:outline-none focus:text-accent lg:hidden"
        >
          <NavbarIcon />
        </motion.button>

        <div className="hidden md:flex ms-5 me-auto">
          <Logo />
        </div>

        <div className="flex items-center space-s-8">
          <AuthorizedMenu />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
