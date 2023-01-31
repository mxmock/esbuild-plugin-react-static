import React from "react";
import ConnectBtn from "./ConnectBtn";
import { useSelector } from "react-redux";
import { getRndInteger } from "../utils/random.utils";

const Header = ({ data }) => {
  const getId = () => data.id;

  const counter = useSelector((store) => store.counterReducer.value);

  React.useEffect(() => {
    console.log("Header appear");
  }, []);

  return (
    <div>
      <div>
        <span>Logo</span>
        <span suppressHydrationWarning={true}>
          App test version {getRndInteger(1, 100)}
        </span>
      </div>

      <div>
        <p>Id data: {getId()}</p>
      </div>

      <p>Counter value is {counter}</p>

      <div>
        <ConnectBtn text={"Connexion"} />
      </div>
    </div>
  );
};

export default Header;
