import React from "react";

const ConnectBtn = ({ text }) => {
  const [counter, setCounter] = React.useState(0);

  React.useEffect(() => {
    console.log("counter:", counter);
  }, [counter]);

  return (
    <>
      <button
        type="button"
        className={"btn"}
        onClick={() => setCounter(counter + 1)}
      >
        <p className="text">{text}</p>
      </button>

      <p>Clicked {counter} times</p>
    </>
  );
};

export default ConnectBtn;
