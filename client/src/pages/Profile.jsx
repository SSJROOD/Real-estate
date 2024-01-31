import { useDispatch, useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutUserStart,
  signOutUserFailure,
  signOutUserSuccess,
} from "../redux/user/userSlice";
import { set } from "mongoose";
import { Link } from "react-router-dom";

//__________________________________________________________________________________________________________________________

const Profile = () => {
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePercent, setFilePercent] = useState(0);
  const [fileError, setFileError] = useState(false);
  const [formdata, setFormdata] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [usernameEditClicked, setUsernameEditClicked] = useState(false);
  const [passwordEditClicked, setPasswordEditClicked] = useState(false);
  const [emailEditClicked, setEmailEditClicked] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [listings, setListings] = useState([]);

  const handleChange = (e) => {
    setFormdata({ ...formdata, [e.target.id]: e.target.value });
  };
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const response = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formdata),
      });
      const data = await response.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const fileChangeHandler = (e) => {
    setFile(e.target.files[0]);
  };
  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePercent(Math.round(progress));
      },
      (error) => {
        setFileError(true);
      },

      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormdata({ ...formdata, avatar: downloadURL });
        });
      }
    );
  };

  const handleDeleteAccount = async () => {
    try {
      dispatch(deleteUserStart());
      const response = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

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


  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const response = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await response.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }
      setListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };
  
  const handleDeleteClick = async (listingID) => {
    try {
      const response = await fetch(`/api/listing/delete/${listingID}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.error(
          `Failed to delete listing with status: ${response.status}`
        );
        return;
      }

      const data = await response.json();

      if (data.success === false) {
        console.log(`Deletion failed: ${data.message}`);
        return;
      }

      setListings((prev) =>
        prev.filter((listing) => listing._id !== listingID)
      );
      console.log("Listing deleted successfully");
    } catch (error) {
      console.error(`Error during listing deletion: ${error.message}`);
    }
  };


  return (
    <div className="p-3 max-w-lg mx-auto ">
      <h1 className="text-3xl font-semibold text-center my-7">profile</h1>
      <form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
        <input
          onChange={fileChangeHandler}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <img
          onClick={() => fileRef.current.click()}
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
          src={formdata.avatar || currentUser.avatar}
          alt=""
        />
        <p className="text-sm self-center">
          {fileError ? (
            <span className="text-red-700">
              Error Image upload (must be less than 2 mb)
            </span>
          ) : filePercent > 0 && filePercent < 100 ? (
            <span className="text-slate-700">{`Uploading ${filePercent}`}</span>
          ) : filePercent === 100 ? (
            <span className="text-green-700">Uploaded successfully</span>
          ) : (
            ""
          )}
        </p>
        <div className="flex justify-between">
          <input
            disabled={!usernameEditClicked}
            defaultValue={currentUser.userName}
            type="text"
            placeholder="username"
            id="userName"
            className=" border w-2/3 p-3 rounded-lg"
            onChange={handleChange}
          />
          <button
            onClick={() => setUsernameEditClicked(true)}
            type="button"
            className="text-blue-500 w-16 text-center font-bold text-lg rounded-lg  hover:text-blue-800 hover:underline "
          >
            Edit
          </button>
        </div>
        <div className="flex justify-between">
          <input
            disabled={!emailEditClicked}
            defaultValue={currentUser.eMail}
            type="email"
            placeholder="email"
            id="eMail"
            className=" w-2/3 border p-3 rounded-lg"
            onChange={handleChange}
          />
          <button
            onClick={() => setEmailEditClicked(true)}
            type="button"
            className="text-blue-500 text-lg w-16 text-center font-bold rounded-lg  hover:text-blue-800 hover:underline "
          >
            Edit
          </button>
        </div>
        <div className="flex justify-between">
          <input
            disabled={!passwordEditClicked}
            type="password"
            placeholder="password"
            id="passWord"
            className="border w-2/3 p-3 rounded-lg"
            onChange={handleChange}
          />
          <button
            onClick={() => setPasswordEditClicked(true)}
            type="button"
            className="text-blue-500 text-lg w-16 text-center font-bold rounded-lg  hover:text-blue-800 hover:underline "
          >
            Edit
          </button>
        </div>

        <button
          disabled={loading}
          className={`bg-slate-700 ${
            usernameEditClicked || passwordEditClicked || emailEditClicked
              ? ""
              : "hidden"
          } text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80`}
        >
          {loading ? "Loading..." : "update"}
        </button>
      </form>
      <div className="flex justify-between mt-5 font-bold">
        <span
          onClick={handleDeleteAccount}
          className="text-red-500 cursor-pointer"
        >
          Delete Account
        </span>
        <span onClick={handlesignout} className="text-red-500 cursor-pointer">
          Sign out{" "}
        </span>
      </div>
      <p className="text-red-700 mt-5">{error ? error : ""}</p>
      <p className="text-green-700">
        {updateSuccess ? "User is updated successfully!" : ""}
      </p>
    

      <button
        onClick={handleShowListings}
        className="text-green-700 w-full cursor-default"
      >
        <span className="cursor-pointer">Show Listings </span>
      </button>
      <p className="text-red-700 mt-5">
        {showListingsError ? "error showing listings" : ""}
      </p>
      {listings &&
        listings.length > 0 &&
        listings.map((listing) => (
          <div key={listing._id} className="flex justify-between mb-4">
            <Link
              to={`/listing/${listing._id}`}
              className="border w-full rounded-lg p-3 cursor-default flex items-center gap-4"
            >
              <img
                src={listing.imageUrls[0]}
                alt="Listing image"
                className="h-16 w-16 object-contain cursor-pointer"
              />
              <p className="cursor-pointer font-semibold hover:underline truncate">
                {listing.name}
              </p>
            </Link>
            <div className=" ml-2 flex flex-col item-center justify-center font-bold">
              <button onClick={()=>handleDeleteClick(listing._id)} className="text-red-500">
                Delete
              </button>
              <button className="text-blue-700">Edit</button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Profile;
//
