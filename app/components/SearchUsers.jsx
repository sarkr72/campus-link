import { useState } from "react";
import Link from "next/link";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (searchQuery.trim().length > 0) {
      window.location.href = `/pages/searchUsers/${searchQuery}`;
    }
  };

  return (
    <div className="container mt-4">
      <form onSubmit={handleFormSubmit}>
        <div className="input-group">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInputChange}
            className="form-control"
            placeholder="Search"
          />
          {searchQuery.trim().length > 0 && (
            <div className="input-group-append">
              <button className="btn btn-primary" type="submit">
                Search
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchPage;
