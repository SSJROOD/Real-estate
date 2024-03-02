import { useEffect, useState } from "react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../firebase";
import { set } from "mongoose";
import { useSelector } from "react-redux";
import {useNavigate,useParams} from 'react-router-dom'

const UpdateListing = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [images, setImages] = useState([]);
  const {id}  = useParams();
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountedPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });

  const [imageUploadError, setImageUploadError] = useState(false);
  const [upLoading, setUpLoading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchListing = async () => {
        const response = await fetch(`/api/listing/getListing/${id}`);
        const data = await response.json();
        if(data.sucess === false){
            console.log(data.message);
        }
        setFormData(data);
    }
    fetchListing();
  }, []);

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };
  const handleImageUpload = (e) => {
    if (images.length > 0 && images.length + formData.imageUrls.length < 8) {
      setUpLoading(true);
      setImageUploadError(false);
      const promises = [];
      for (let i = 0; i < images.length; i++) {
        promises.push(storeImage(images[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUpLoading(false);
        })
        .catch((error) => {
          setImageUploadError("Image upload failed (2 mb max per image)");
        });
    } else {
      images.length === 0
        ? setImageUploadError("No images selected")
        : setImageUploadError("You can only upload 7 images per listing");
      setUpLoading(false);
    }
  };

  const handleDeleteImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleFormChange = (e) => {
    if (e.target.id === "sell" || e.target.id === "rent") {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }

    if (
      e.target.id === "parking" ||
      e.target.id === "furnished" ||
      e.target.id === "offer"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }

    if (e.target.type === "number" || e.target.type === "text") {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError("You need to upload at least one image");
      if (+formData.regularPrice < +formData.discountedPrice)
        return setError("Discounted price can't be higher than regular price");
      
      setLoading(true);
      setError(false);
      const response = await fetch(`/api/listing/update/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, userRef: currentUser._id }),
      });
      console.log(response);
      const data = await response.json();
      setLoading(false);
      if (data.sucess === false) {
        setError(data.message);
      }
      navigate(`/listing/${data._id}`)
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };


  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Edit Listing
      </h1>
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength={62}
            minLength={10}
            required
            onChange={handleFormChange}
            value={formData.name}
          />
          <input
            type="text"
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
            onChange={handleFormChange}
            value={formData.description}
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            required
            onChange={handleFormChange}
            value={formData.address}
          />

          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input
                type="checkbox"
                name=""
                id="sell"
                className="w-5"
                onChange={handleFormChange}
                checked={formData.type === "sell"}
              />
              <label htmlFor="sell">
                <span>Sell</span>
              </label>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                name=""
                id="rent"
                className="w-5"
                onChange={handleFormChange}
                checked={formData.type === "rent"}
              />
              <label htmlFor="rent">
                <span>Rent</span>
              </label>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                onChange={handleFormChange}
                checked={formData.parking}
              />
              <label htmlFor="sell">
                <span>Parking spot</span>
              </label>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                name=""
                id="furnished"
                className="w-5"
                onChange={handleFormChange}
                checked={formData.furnished}
              />
              <label htmlFor="sell">
                <span>Furnished</span>
              </label>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                name=""
                id="offer"
                className="w-5"
                onChange={handleFormChange}
                checked={formData.offer}
              />
              <label htmlFor="sell">
                <span>Offer</span>
              </label>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-1">
              <input
                type="number"
                id="bedrooms"
                min={1}
                required
                className="rounded-lg appearance-none p-2 border border-gray-300 w-16 h-12"
                onChange={handleFormChange}
                value={formData.bedrooms}
              />
              <label htmlFor="bedroom">Bed</label>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                id="bathrooms"
                min={1}
                required
                className="rounded-lg appearance-none p-2 border border-gray-300 w-16 h-12"
                onChange={handleFormChange}
                value={formData.bathrooms}
              />
              <label htmlFor="bathroom">Bath</label>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                id="regularPrice"
                min={50}
                max={100000}
                required
                className="rounded-lg appearance-none p-2 border border-gray-300 w-16 h-12"
                onChange={handleFormChange}
                value={formData.regularPrice}
              />
              <label htmlFor="bedroom">
                <div className="flex flex-col items-center">
                  <p>Regular price</p>
                  <p className="text-xs">($ / month)</p>
                </div>
              </label>
            </div>
            {formData.offer && (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  id="discountedPrice"
                  min={0}
                  max={1000000}
                  required
                  className="rounded-lg appearance-none p-2 border border-gray-300 w-16 h-12"
                  onChange={handleFormChange}
                  value={formData.discountedPrice}
                />
                <label htmlFor="bedroom">
                  <div className="flex flex-col items-center">
                    <p>Discounted price</p>
                    <p className="text-xs">($ / month)</p>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col  gap-4">
          <div className="flex gap-1">
            <p className="font-semibold">Images: </p>
            <p className="text-gray-700">
              The first image will be the cover (max 6)
            </p>
          </div>
          <div className="flex gap-4 ">
            <input
              onChange={(e) => setImages(e.target.files)}
              className="p-3 border border-gray-300 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
            />
            <button
              disabled={upLoading}
              type="button"
              onClick={handleImageUpload}
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
            >
              {upLoading ? "Uploading..." : "Upload"}
            </button>
          </div>
          <p className="text-red-700">{imageUploadError && imageUploadError}</p>
          {formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, index) => (
              <div
                key={url}
                className="flex justify-between p-3 border items-center"
              >
                <img
                  src={url}
                  alt="Listing Image"
                  className="w-20 h-20 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(index)}
                  className="p-3 text-red-700 rounded-lg uppercase hover:opacity-60"
                >
                  Delete
                </button>
              </div>
            ))}
          <button disabled={loading || upLoading}className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
            {loading ? "Creating..." : "Update Listing"}
          </button>
          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
};



export default UpdateListing