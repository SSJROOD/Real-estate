import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Header = () => {
  const currentUser = useSelector((state) => state.user.currentUser);
  return (
    <header className="bg-slate-200 shadow-md ">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
          <span className="text-slate-500">Rood</span>
          <span className="text-slate-700">Estate</span>
        </h1>
        <form className="bg-slate-100 p-3 rounded-lg flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent focus:outline-none w-24 sm:w-64"
          />
          <FaSearch className="text-slate-600" />
        </form>
        <ul className="flex gap-4">
          <li className="hidden sm:inline text-slate-700 hover:underline cursor-pointer">
            <Link to="/home">Home</Link>
          </li>
          <li className="hidden sm:inline text-slate-700 hover:underline cursor-pointer">
            <Link to="/about">About</Link>
          </li>

          {currentUser ? (
            <li>
              <Link to={"/profile"}>
                <img
                  className="rounded-full h-8 w-8 object-cover"
                  src={currentUser.avatar}
                  alt="profile-Picture"
                />
              </Link>
            </li>
          ) : (
            <li className="hidden sm:inline text-slate-700 hover:underline cursor-pointer">
              <Link to="/sign-in">Sign In</Link>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
};

export default Header;
