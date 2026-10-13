import { Link } from "react-router-dom";
import { MdLightMode } from "react-icons/md";
import { FaMoon } from "react-icons/fa";
import { useEffect, useState } from "react";
import { truncate, useGlobalState } from "../store";
import { connectWallet } from "../Blockchain.services";

const Header = () => {
  const [theme, setTheme] = useState(localStorage.theme || "light");
  const themeColor = theme === "dark" ? "light" : "dark";
  const darken = theme === "dark";
  const [connectedAccount] = useGlobalState("connectedAccount");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(themeColor);
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [themeColor, theme]);

  const toggleLight = () => {
    const root = window.document.documentElement;
    root.classList.remove(themeColor);
    root.classList.add(themeColor);
    localStorage.setItem("theme", themeColor);
    setTheme(themeColor);
  };

  return (
    <header className="sticky top-0 z-50 dark:text-blue-500">
      <nav
        className="navbar navbar-expand-lg shadow-md py-2 relative flex items-center w-full justify-between bg-white dark:bg-[#212936]"
      >
        <div className="px-6 w-full flex flex-wrap items-center justify-between">
          <div className="grow flex flex-row justify-between items-center p-2">
            <Link
              to={"/"}
              className="flex flex-row justify-start items-center space-x-3"
            >
              <img
                src="https://haitrieu.com/wp-content/uploads/2021/10/Logo-Hoc-Vien-Cong-Nghe-Buu-Chinh-Vien-Thong-PTITSimple-635x807.png"
                className="w-10 h-10 object-contain"
                alt="logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="invisible md:visible dark:text-gray-300 font-bold text-xl text-gray-800">
                PTIT Dominion
              </span>
            </Link>
            <div className="flex flex-row justify-center items-center space-x-5">
              {darken ? (
                <MdLightMode
                  className="cursor-pointer text-yellow-400"
                  size={25}
                  onClick={toggleLight}
                />
              ) : (
                <FaMoon
                  className="cursor-pointer text-gray-600"
                  size={25}
                  onClick={toggleLight}
                />
              )}
              {connectedAccount ? (
                <button
                  type="button"
                  className="px-4 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded-full shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out dark:text-blue-500 dark:border dark:border-blue-500 dark:bg-transparent"
                >
                  {truncate(connectedAccount, 4, 4, 11)}
                </button>
              ) : (
                <button
                  type="button"
                  className="px-4 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded-full shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out dark:text-blue-500 dark:border dark:border-blue-500 dark:bg-transparent"
                  onClick={connectWallet}
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
