import React from "react";
import { useDispatch } from "react-redux";
import { decrement, increment } from "../redux/counter/counter.slice";

const ConnectBtn = ({ text }) => {
  const dispatch = useDispatch();

  const handleIncrement = () => {
    const action = increment();
    console.log(action);
    dispatch(action);
  };

  const handleDecrement = () => {
    const action = decrement();
    console.log(action);
    dispatch(action);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Increment value"
        onClick={handleIncrement}
      >
        Increment
      </button>
      <button
        type="button"
        aria-label="Decrement value"
        onClick={handleDecrement}
      >
        Decrement
      </button>
    </>
  );
};

export default ConnectBtn;
