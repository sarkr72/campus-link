import React, { useState } from "react";

function Rating({
  value,
  color,
  size = "24px",
  onRatingChange,
  difficultyLevels,
}) {
  const [hoveredLevel, setHoveredLevel] = useState(null);
  const [hoveredLevel2, setHoveredLevel2] = useState(null);

  return (
    <div>
      <div className="rating">
        <span>
          <i
            style={{ color, fontSize: size }}
            className={
              value >= 1
                ? "fas fa-star"
                : value >= 0.5
                ? "fas fa-star-half-alt"
                : "far fa-star"
            }
            onClick={() => {
              difficultyLevels ? (onRatingChange(1), setHoveredLevel2(1)) : null;
            }}
            onMouseOver={() => setHoveredLevel(1)}
            onMouseOut={() => setHoveredLevel(null)}
          ></i>
        </span>

        <span>
          <i
            style={{ color, fontSize: size }}
            className={
              value >= 2
                ? "fas fa-star"
                : value >= 1.5
                ? "fas fa-star-half-alt"
                : "far fa-star"
            }
            onClick={() => {
              difficultyLevels ? (onRatingChange(2), setHoveredLevel2(2)) : null;
            }}
            onMouseOver={() => setHoveredLevel(2)}
            onMouseOut={() => setHoveredLevel(null)}
          ></i>
        </span>

        <span>
          <i
            style={{ color, fontSize: size }}
            className={
              value >= 3
                ? "fas fa-star"
                : value >= 2.5
                ? "fas fa-star-half-alt"
                : "far fa-star"
            }
            onClick={() => {
              difficultyLevels ? (onRatingChange(3), setHoveredLevel2(3)) : null;
            }}
            onMouseOver={() => setHoveredLevel(3)}
            onMouseOut={() => setHoveredLevel(null)}
          ></i>
        </span>

        <span>
          <i
            style={{ color, fontSize: size }}
            className={
              value >= 4
                ? "fas fa-star"
                : value >= 3.5
                ? "fas fa-star-half-alt"
                : "far fa-star"
            }
            onClick={() => {
              difficultyLevels ? (onRatingChange(4), setHoveredLevel2(4)) : null;
            }}
            onMouseOver={() => setHoveredLevel(4)}
            onMouseOut={() => setHoveredLevel(null)}
          ></i>
        </span>

        <span>
          <i
            style={{ color, fontSize: size }}
            className={
              value >= 5
                ? "fas fa-star"
                : value >= 4.5
                ? "fas fa-star-half-alt"
                : "far fa-star"
            }
            onClick={() => {
              difficultyLevels ? (onRatingChange(5), setHoveredLevel2(5)) : null;
            }}
            onMouseOver={() => setHoveredLevel(5)}
            onMouseOut={() => setHoveredLevel(null)}
          ></i>
        </span>
      </div>
      <div style={{ display: "flex" }}>
        {difficultyLevels && hoveredLevel2 && (
          <p>
            {difficultyLevels[hoveredLevel2 - 1].value} -{" "}
            {difficultyLevels[hoveredLevel2 - 1].level}
          </p>
        )}
        <div style={{ width: "10px", display: "inline-block" }} />
        {difficultyLevels && hoveredLevel && (
          <p>
            {difficultyLevels[hoveredLevel - 1].value} -{" "}
            {difficultyLevels[hoveredLevel - 1].level}
          </p>
        )}
      </div>
      <div style={{ display: "flex" }}></div>
    </div>
  );
}
export default Rating;
