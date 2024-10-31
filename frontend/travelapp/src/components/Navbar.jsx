import React from "react";
import logo from "../assets/logo.svg";
import ProfileInfo from "./Cards/ProfileInfo";
import { useNavigate } from "react-router-dom";
import SearchBar from "./input/SearchBar";

const Navbar = ({
  userInfo,
  searchQuery,
  setSearchQuery,
  onSearchNote,
  handleClearSearch
}) => {
  const isToken = localStorage.getItem("token");
  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSearch = () => {
    if(searchQuery){
      onSearchNote(searchQuery);
    }
  };

  const onClearSearch = () => {
    handleClearSearch();
    setSearchQuery("");
  };

  const handleall = () => {
    navigate("/all");
  };

  return (
    <div className=" bg-white flex items-center justify-between px-6 py-2 drop-shadow sticky top-0 z-10">
      <img src={logo} alt="Travel Story Logo" className="h-16" />

      <h3 onClick={handleall} className=" cursor-pointer text-slate-600 font-semibold">See All Stories</h3>

      {isToken && (
        <>
          <SearchBar
            value={searchQuery}
            onChange={({ target }) => {
              setSearchQuery(target.value);
            }}
            handleSearch={handleSearch}
            onClearSearch={onClearSearch}
          />
          <ProfileInfo userInfo={userInfo} onLogout={onLogout} />{" "}
        </>
      )}
    </div>
  );
};

export default Navbar;
