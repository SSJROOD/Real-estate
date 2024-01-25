import { FaSearch } from "react-icons/fa";

const Home = () => {
  const imgAdd =
    "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  return (
    <div className="relative">
      <div className="w-full h-96 overflow-hidden relative">
        <img
          src={imgAdd}
          alt=""
          className="w-full h-full object-cover object-bottom"
        />
        <div className="flex flex-row items-center justify-between w-3/5 rounded-md h-20  border absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white opacity-90">
          <div className="w-11/12 pl-2">
            <input
              type="text"
              placeholder="Enter an address, neighborhood, city, or ZIP code"
              className="w-full outline-none"
            />
          </div>
          <div className="text-cyan-400 flex-1 h-full flex items-center text-xl cursor-pointer hover:bg-blue-50  active:bg-blue-100 ">
            <FaSearch className="mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
