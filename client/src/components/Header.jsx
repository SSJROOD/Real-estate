import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signOutUserFailure,
  signOutUserSuccess,
  signOutUserStart,
} from "../redux/user/userSlice";
import { useEffect, useRef, useState } from "react";

const Header = () => {
  const currentUser = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);


  const handlesignout = async () => {
    try {
      dispatch(signOutUserStart());
      const response = await fetch("/api/auth/signout");
      const data = await response.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };
  

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setOpen(false);
    }
  };


  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  return (
    <header className="bg-white  shadow-md w-full h-24 flex  font-normal flex-col justify-center text-lg overflow-hidden ">
      <div className="w-full flex justify-between items-center p-2">
        <ul className="flex gap-4 ml-4">
          <li className="hover:text-blue-500">
            <Link>Buy</Link>
          </li>
          <li className="hover:text-blue-500">
            <Link>Rent</Link>
          </li>
          <li className="hover:text-blue-500">
            <Link>Sell</Link>
          </li>
        </ul>

        <h1 className="font-bold text-2xl sm:text-4xl flex-wrap">
          <Link to={"/home"}>
            <span className="text-slate-500">Rood</span>
            <span className="text-slate-700">Estate</span>
          </Link>
        </h1>

        <ul className="flex gap-10 mr-4">
          <li className="hidden sm:inline text-slate-700 hover:text-blue-500 cursor-pointer">
            <Link to="/create-listing">Create Listing</Link>
          </li>
          <li className="hidden sm:inline text-slate-700 hover:text-blue-500 cursor-pointer">
            <Link to="/about">About</Link>
          </li>

          {currentUser ? (
            <li>
              <img
                className="rounded-full h-8 w-8 object-cover cursor-pointer"
                src={currentUser.avatar}
                alt="profile-Picture"
                onClick={() => setOpen(!open)}
              />

              <ul
                onClick={() => setOpen(false)}
                ref={dropdownRef}
                className={`${
                  open ? "" : "hidden"
                }  bg-white fixed top-20 w-72 right-7 rounded-lg p-3 transition z-10 duration-300 ease-in-out`}
              >
                <li className="block">
                  <div className="hover:bg-blue-50 cursor-pointer p-3">
                    <Link to={"/create-listing"}>Create Listing</Link>
                  </div>
                </li>
                <li className="block">
                  <div className="hover:bg-blue-50 cursor-pointer p-3">
                    <Link to={"/profile"}>Profile Settings</Link>
                  </div>
                </li>
                <li className="block">
                  <div
                    className="hover:bg-blue-50 cursor-pointer p-3"
                    onClick={handlesignout}
                  >
                    Sign out
                  </div>
                </li>
              </ul>
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
