import React, { useState } from "react";
import DeleteModal from "../components/DeleteModal";

const Home = () => {
  return (
    <div>
      <button onClick={() => setModal(true)}>delete</button>
      
    </div>
  );
};

export default Home;
