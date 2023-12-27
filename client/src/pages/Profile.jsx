import { useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";

const Profile = () => {
  const fileRef = useRef(null);
  const currentUser = useSelector((state) => state.user.currentUser);
  const [file, setFile] = useState(undefined);
  const [filePercent, setFilePercent] = useState(0);
  const [fileError, setFileError] = useState(false);
  const [formdata, setFormdata] = useState({});

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

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">profile</h1>
      <form className="flex flex-col gap-4">
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
          type="text"
          placeholder="username"
          id="username"
          className="border p-3 rounded-lg"
        />
        <input
          type="email"
          placeholder="email"
          id="eMail"
          className="border p-3 rounded-lg"
        />
        <input
          type="password"
          placeholder="password"
          id="passWord"
          className="border p-3 rounded-lg"
        />
        <button className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:95 disabled:opacity-80">
          update
        </button>
      </form>
      <div className="flex justify-between mt-5">
        <span className="text-red-700 cursor-pointer">Delete Account</span>
        <span className="text-red-700 cursor-pointer">Sign out </span>
      </div>
    </div>
  );
};

export default Profile;
