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
import DeleteModal from "../components/DeleteModal";
import { set } from "mongoose";
import { Link } from "react-router-dom";

//__________________________________________________________________________________________________________________________

const Profile = () => {
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const [modal, setModal] = useState(false);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePercent, setFilePercent] = useState(0);
  const [fileError, setFileError] = useState(false);
  const [formdata, setFormdata] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
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
    setModal(false);
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

  const modalStyle = `fixed inset-0 flex justify-center items-center transition-colors`;


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
        <input
          defaultValue={currentUser.userName}
          type="text"
          placeholder="username"
          id="userName"
          className="border p-3 rounded-lg cursor-default"
          onChange={handleChange}
        />
        <input
          defaultValue={currentUser.eMail}
          type="email"
          placeholder="email"
          id="eMail"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          id="passWord"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading..." : "update"}
        </button>
       
      </form>
      <div className="flex justify-between mt-5">
        <span
          onClick={() => setModal(true)}
          className="text-red-700 cursor-pointer"
        >
          Delete Account
        </span>
        <span onClick={handlesignout} className="text-red-700 cursor-pointer">
          Sign out{" "}
        </span>
      </div>
      <p className="text-red-700 mt-5">{error ? error : ""}</p>
      <p className="text-green-700">
        {updateSuccess ? "User is updated successfully!" : ""}
      </p>
      <DeleteModal
        open={modal}
        onClose={() => {
          setModal(false);
        }}
        style={modalStyle}
      >
        <p1>Are you sure you want to delete your account?</p1> <br />
        <div className="flex gap-4 items-center justify-center py-2 px-4 font-semibold">
          <button
            className=" rounded-lg shadow-lg w-full text-gray-500"
            onClick={() => setModal(false)}
          >
            <span>No</span>
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full rounded-lg text-white bg-red-600 shadow-red-400/40"
          >
            <span>Yes</span>
          </button>
        </div>
      </DeleteModal>
    </div>
  );
};

export default Profile;
//